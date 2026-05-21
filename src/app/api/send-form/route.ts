// app/api/send-form/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Конфигурация SMTP
const smtpConfig = {
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: "ForAnalyticss@yandex.ru", // Измените на правильный email
    pass: "mrsezovxgogmbqfz", // Нужно указать правильный пароль!
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

function createEmailHTML(data: {
  name?: string;
  phone: string;
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
    const { name, phone, message, topic } = body;

    console.log('📝 Данные формы:', { name, phone, message, topic });

    // Проверяем обязательные поля
    if (!phone) {
      console.log('❌ Ошибка: телефон не указан');
      return NextResponse.json(
        { error: 'Телефон обязателен для заполнения' },
        { status: 400 }
      );
    }

    // Определяем тему письма
    const dateTime = new Date().toLocaleString('ru-RU');
    const subject = `Заявка на сайте от ${dateTime}`;

    // Создаем HTML письма
    const html = createEmailHTML({ name, phone, message, topic });

    console.log('📧 Отправка письма на 73polimer@mail.ru...');

    // Отправляем письмо основному получателю
    const mainResult = await transporter.sendMail({
      from: '"Аналитический центр развитие" <ForAnalyticss@yandex.ru>',
      to: '73polimer@mail.ru',
      subject: subject,
      html: html,
    });

    console.log('✅ Письмо отправлено основному получателю:', mainResult.messageId);

    // Отправляем копию
    console.log('📧 Отправка копии на ForAnalyticss@yandex.ru...');
    const copyResult = await transporter.sendMail({
      from: '"Аналитический центр развитие" <ForAnalyticss@yandex.ru>',
      to: 'ForAnalyticss@yandex.ru',
      subject: subject,
      html: html,
    });

    console.log('✅ Копия отправлена:', copyResult.messageId);

    return NextResponse.json({
      success: true,
      message: 'Форма успешно отправлена'
    });

  } catch (error: any) {
    console.error('❌ Критическая ошибка при отправке:', error);

    // Детальный вывод ошибки
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
        error: 'Ошибка отправки письма',
        details: error.message
      },
      { status: 500 }
    );
  }
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



