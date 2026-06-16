// app/api/send-form/route.ts
import { createDeal, findContactByPhone, upsertContact } from '@/lib/bitrix24-service';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Конфигурация SMTP
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.yandex.ru',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER, // Измените на правильный email
    pass: process.env.SMTP_PASS, // Нужно указать правильный пароль!
  },
};

// Создаем transporter
const transporter = nodemailer.createTransport(smtpConfig);

// Проверяем соединение при старте
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Ошибка подключения к SMTP:', error);
  } else {
    console.log('✅ SMTP соединение настроено правильно');
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Добавляем email в интерфейс данных формы
function createEmailHTML(data: {
  name?: string;
  phone: string;
  email?: string;  // Добавляем email
  message?: string;
  topic?: string;
}): string {
  const currentDate = new Date().toLocaleString('ru-RU');
  const formType = data.topic || (data.message ? 'Полная форма' : 'Быстрая форма');

  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Заявка с сайта</title>
    </head>
    <body style="text-align: center; font-family: arial, sans-serif;">
      <div style="width:100%; background: #eee; padding:30px; display: inline-block;">
        <div style="width:600px; background: #eee; padding:0px; display: inline-block;">
          <div style="text-align: center; background-color: #fff; padding: 30px; border-radius: 3px; line-height: 24px;">
            <h2 style="margin-top: 10px; color:#000">
              Заявка на сайте <span style="color: #203c97;">73полимер.рф</span>
            </h2>
            <p style="color: #666; font-size: 12px;">Время отправки: ${currentDate}</p>
            
            <table style="margin-top: 20px; text-align: left; width: 100%;">
              <tr>
                <td style="width: 100%; color: #000;">
                  <ul style="list-style-type: none; margin: 0px; padding: 0px; font-size: 14px;">
                    <li style="width: 100%; padding: 10px 0px; border-bottom: 1px solid #eee;">
                      <span>Форма:</span> 
                      <b style="float: right;">${formType}</b>
                    </li>
                    ${data.name ? `
                    <li style="width: 100%; padding: 10px 0px; border-bottom: 1px solid #eee;">
                      <span>Имя:</span> 
                      <b style="float: right;">${escapeHtml(data.name)}</b>
                    </li>
                    ` : ''}
                    ${data.email ? ` 
                    <li style="width: 100%; padding: 10px 0px; border-bottom: 1px solid #eee;">
                      <span>Email:</span> 
                      <b style="float: right;">${escapeHtml(data.email)}</b>
                    </li>
                    ` : ''}
                    <li style="width: 100%; padding: 10px 0px; border-bottom: 1px solid #eee;">
                      <span>Телефон:</span> 
                      <b style="float: right;">${escapeHtml(data.phone)}</b>
                    </li>
                    ${data.message ? `
                    <li style="width: 100%; padding: 10px 0px; border-bottom: 1px solid #eee;">
                      <span>Сообщение:</span> 
                      <b style="float: right; max-width: 60%; text-align: right;">${escapeHtml(data.message)}</b>
                    </li>
                    ` : ''}
                    ${data.topic ? `
                    <li style="width: 100%; padding: 10px 0px; border-bottom: 1px solid #eee;">
                      <span>Тема:</span> 
                      <b style="float: right;">${escapeHtml(data.topic)}</b>
                    </li>
                    ` : ''}
                  </ul>
                </td>
              </tr>
            </table>
          </div>
          
          <table style="text-align: center; font-size: 12px; width: 100%; padding: 20px 0px;">
            <tr>
              <td>Техподдержка</td>
              <td>Аналитический центр развитие</td>
              <td>+7 (927) 270-53-30</td>
              <td><a href="https://acr-agency.ru/">acr-agency.ru</a></td>
            </tr>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  console.log('📨 Получен POST запрос на /api/send-form');

  try {
    // Получаем данные из запроса
    const body = await request.json();
    let { name, phone, email, message, topic, pageUrl, pageTitle } = body;

    // Валидируем и нормализуем email
    const emailValidation = validateAndNormalizeEmail(email);
    if (emailValidation.isValid) {
      email = emailValidation.normalizedEmail;
      console.log('✅ Email прошел валидацию:', email);
    } else if (email && email.trim() !== '') {
      console.log('⚠️ Email не прошел валидацию, будет проигнорирован:', email);
      email = undefined; // Игнорируем невалидный email
    } else {
      email = undefined;
    }

    console.log('📝 Данные формы:', { name, phone, email, message, topic, pageUrl });

    // Проверяем обязательные поля
    if (!phone) {
      console.log('❌ Ошибка: телефон не указан');
      return NextResponse.json(
        { error: 'Телефон обязателен для заполнения' },
        { status: 400 }
      );
    }

    // ======== БЛОК ОТПРАВКИ ПИСЕМ ========

    // Определяем тему письма
    const dateTime = new Date().toLocaleString('ru-RU');
    const subject = `Заявка на сайте от ${dateTime}`;

    // Создаем HTML письма (передаем email)
    const html = createEmailHTML({ name, phone: phone, email, message, topic });

    // console.log('📧 Отправка письма на 73polimer@mail.ru...');

    // // Отправляем письмо основному получателю 
    // const mainResult = await transporter.sendMail({
    //   from: '"Полимеры" <ForAnalyticss@yandex.ru>',
    //   to: '73polimer@mail.ru',
    //   subject: subject,
    //   html: html,
    // });

    // Отправляем копию
    console.log('📧 Отправка копии на ForAnalyticss@yandex.ru...');
    const copyResult = await transporter.sendMail({
      from: '"Аналитический центр развитие" <ForAnalyticss@yandex.ru>',
      to: 'ForAnalyticss@yandex.ru',
      subject: subject,
      html: html,
    });

    console.log('✅ Копия отправлена:', copyResult.messageId);

    // ======== CRM ИНТЕГРАЦИЯ ========

    let crmResult = null;

    const crmPromise = processCrmIntegration({
      name: name || 'Не указано',
      phone: phone,
      email: email,
      message: message || '',
      pageUrl: pageUrl || 'https://73полимер.рф',
      pageTitle: pageTitle || pageUrl || 'Страница сайта', // <-- добавили
      formId: 'popup_form_main',
    });

    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve(null), 8000);
    });

    crmResult = await Promise.race([crmPromise, timeoutPromise]);

    if (crmResult) {
      console.log('🎉 CRM интеграция выполнена:', crmResult);
    } else {
      console.log('⚠️ CRM интеграция не выполнена или превышен таймаут');
    }

    // ======== ФОРМИРУЕМ ОТВЕТ ========

    const responseData: any = {
      success: true,
      message: 'Форма успешно отправлена',
      emailSent: true,
    };

    if (crmResult) {
      responseData.crm = {
        contactId: (crmResult as any)?.contactId,
        dealId: (crmResult as any)?.dealId,
      };
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('❌ Критическая ошибка при отправке:', error);

    const errorDetails = {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    };

    console.error('Детали ошибки:', errorDetails);

    return NextResponse.json(
      {
        error: 'Ошибка отправки формы',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Добавляем новую функцию для обработки CRM

async function processCrmIntegration(data: {
  name: string;
  phone: string;
  message: string;
  pageUrl: string;
  pageTitle: string;
  email?: string;
  formId: string;
}): Promise<{ contactId: number; dealId: number } | null> {
  try {
    console.log('🔄 Начало интеграции с Bitrix24 CRM');

    // if (!data.phone || data.phone.length !== 11) {
    //   console.log('❌ Некорректный номер телефона для CRM');
    //   return null;
    // }

    // Поиск существующего контакта
    const existingContactId = await findContactByPhone(data.phone);

    // Создаем или обновляем контакт (передаем email)
    const contactId = await upsertContact(
      data.name,
      data.phone,
      data.pageUrl,
      data.pageTitle || 'Страница сайта',
      existingContactId,
      data.email,  // Передаем email
      data.message
    );

    if (!contactId) {
      throw new Error('Не удалось получить ID контакта');
    }

    // Создаем сделку
    const dealId = await createDeal(
      contactId,
      data.name,
      data.phone,
      data.message,
      true,
      data.pageUrl,
      data.pageTitle || 'Страница сайта',
      data.formId
    );

    console.log('✅ CRM интеграция успешна:', { contactId, dealId });
    return { contactId, dealId };

  } catch (error) {
    console.error('❌ Ошибка CRM интеграции:', error);
    return null;
  }
}

// Функция для валидации и нормализации email
function validateAndNormalizeEmail(email?: string): { isValid: boolean; normalizedEmail: string | null } {
  if (!email || email.trim() === '') {
    return { isValid: false, normalizedEmail: null };
  }

  // Удаляем лишние пробелы и приводим к нижнему регистру
  let normalizedEmail = email.trim().toLowerCase();

  // Удаляем недопустимые символы (оставляем только буквы, цифры, точки, дефисы, подчеркивания, @)
  normalizedEmail = normalizedEmail.replace(/[^\w\s@.-]/g, '');

  // Базовая проверка формата email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValid = emailRegex.test(normalizedEmail);

  if (!isValid) {
    console.log(`⚠️ Невалидный email: ${email} -> ${normalizedEmail}`);
    return { isValid: false, normalizedEmail: null };
  }

  return { isValid: true, normalizedEmail };
}

// Обработка OPTIONS запроса для CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}



