// lib/bitrix24-service.ts

import { BITRIX_CONFIG, UF_FIELDS } from './bitrix24';

// Базовая функция вызова Bitrix24 API
async function callBitrix(method: string, params: Record<string, any> = {}) {
  if (!BITRIX_CONFIG.webhookUrl) {
    throw new Error('BITRIX_CONFIG.webhookUrl is not defined');
  }

  const baseUrl = BITRIX_CONFIG.webhookUrl as string;
  const url = `${baseUrl}${method}.json`;

  // Для методов, которые изменяют данные (add, update), используем POST с телом
  // Для методов чтения (get, find) можно использовать GET с параметрами в URL

  const isReadMethod = method.includes('.get') || method.includes('.find') || method.includes('.list');

  let fullUrl = url;
  let body: string | undefined;

  if (isReadMethod) {
    // Для GET-запросов параметры в URL
    const queryParams = buildQueryString(params);
    fullUrl = queryParams ? `${url}?${queryParams}` : url;
  } else {
    // Для POST-запросов параметры в теле
    body = buildQueryString(params);
  }

  const safeUrl = fullUrl.replace(/\/rest\/\d+\/[^/]+\//, '/rest/***/');
  console.log(`🔷 Bitrix24 API call: ${method}`);
  console.log('📤 URL:', safeUrl);
  if (body) {
    console.log('📤 Body (первые 200 символов):', body.substring(0, 200));
  }

  try {
    const fetchOptions: RequestInit = {
      method: isReadMethod ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    if (body) {
      fetchOptions.body = body;
    }

    const response = await fetch(fullUrl, fetchOptions);

    const result = await response.json();

    console.log(`📥 Response from ${method}:`, JSON.stringify(result, null, 2));

    if (result.error) {
      console.error(`❌ Bitrix24 API error [${method}]:`, result);
      throw new Error(`Bitrix24 error: ${result.error_description || result.error}`);
    }

    return result;
  } catch (error) {
    console.error(`❌ Network error [${method}]:`, error);
    throw error;
  }
}

// Вспомогательная функция для построения query string
function buildQueryString(params: Record<string, any>): string {
  function buildParts(obj: any, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {};

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const newPrefix = `${prefix}[${index}]`;
        Object.assign(result, buildParts(item, newPrefix));
      });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        const newPrefix = prefix ? `${prefix}[${key}]` : key;
        Object.assign(result, buildParts(value, newPrefix));
      });
    } else {
      if (obj !== undefined && obj !== null) {
        result[prefix] = String(obj);
      }
    }

    return result;
  }

  const allParams: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object') {
        Object.assign(allParams, buildParts(value, key));
      } else {
        allParams[key] = String(value);
      }
    }
  });

  const parts: string[] = [];
  Object.entries(allParams).forEach(([key, value]) => {
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  });

  return parts.join('&');
}

// Поиск контакта по телефону
export async function findContactByPhone(phone: string): Promise<number | null> {
  try {
    const clean = phone;
    console.log('🔍 Поиск контакта по телефону:', clean);

    const result = await callBitrix('crm.duplicate.findbycomm', {
      entity_type: 'CONTACT',
      type: 'PHONE',
      values: [clean],
    });

    const contacts = result?.result?.CONTACT;
    if (contacts && contacts.length > 0) {
      console.log(`✅ Контакт найден: ${contacts[0]}`);
      return contacts[0];
    }

    console.log('ℹ️ Контакт не найден');
    return null;
  } catch (error) {
    console.error('❌ Ошибка поиска контакта:', error);
    return null;
  }
}

// Получить контакт по ID
export async function getContact(contactId: number) {
  try {
    const result = await callBitrix('crm.contact.get', {
      id: contactId,
    });
    return result.result;
  } catch (error) {
    console.error('❌ Ошибка получения контакта:', error);
    return null;
  }
}

// Добавить комментарий к контакту (сохраняем историю обращений)
async function addContactComment(contactId: number, comment: string) {
  try {
    const contact = await getContact(contactId);
    let currentComments = contact?.COMMENTS || '';

    const now = new Date().toISOString();

    const separator = '----------------------';

    const newComment = `${separator}
Новое обращение: ${now}

${comment}

${separator}`;

    const updatedComments = currentComments
      ? `${newComment}\n\n${currentComments}`
      : newComment;

    const result = await callBitrix('crm.contact.update', {
      id: contactId,
      FIELDS: {
        COMMENTS: updatedComments,
      },
    });

    console.log('✅ Комментарий контакта обновлен');
    return result;

  } catch (error) {
    console.error('❌ Ошибка обновления комментария контакта:', error);
  }
}
// Создание сделки
export async function createDeal(
  contactId: number,
  name: string,
  phone: string,
  message: string,
  agreement: boolean,
  pageUrl: string,
  pageTitle: string,
  formId: string
): Promise<number> {
  console.log('💰 Создание сделки для контакта:', contactId);

  if (!contactId) {
    throw new Error('Не указан ID контакта для создания сделки');
  }

  let dealTitle = `Заявка с сайта: ${name} ${phone}`;


  if (dealTitle.length > 200) {
    dealTitle = dealTitle.substring(0, 197) + '...';
  }


  const readableUrl = decodeURI(pageUrl);

  const FIELDS: Record<string, any> = {
    TITLE: dealTitle,
    CATEGORY_ID: 23, 
    CONTACT_ID: contactId,
    STAGE_ID: 'NEW',
    SOURCE_ID: "9677718153",
    SOURCE_DESCRIPTION: `${readableUrl}`,
    ASSIGNED_BY_ID: 14,
    DESCRIPTION: `📝 Сообщение: ${message || 'Не указано'}\n\nСтраница: ${pageTitle}\n URL: ${readableUrl}`,
  };

  if (message) {
    FIELDS[UF_FIELDS.message] = message;
  }
  console.log("Согласие:", agreement ? 'Да' : 'Нет');
  
  FIELDS[UF_FIELDS.agreement] = agreement ? 'Y' : 'N';

  if (UF_FIELDS.formId && UF_FIELDS.formId !== 'UF_CRM_XXXXXXXXXX') {
    FIELDS[UF_FIELDS.formId] = formId;
  }

  console.log('📦 Название сделки:', dealTitle);

  const result = await callBitrix('crm.deal.add', {
    FIELDS: FIELDS,
  });

  const dealId = result.result;
  console.log('✅ Сделка создана:', dealId);
  return dealId;
}



// Создание или обновление контакта
export async function upsertContact(
  name: string,
  phone: string,
  pageUrl: string,
  pageTitle: string,
  existingContactId: number | null = null,
  email?: string,
  message?: string
): Promise<number> {
   const readableUrl = decodeURI(pageUrl);
  const FIELDS: Record<string, any> = {
    NAME: name,
    PHONE: [
      { VALUE:phone, VALUE_TYPE: 'WORK' }
    ],
    SOURCE_ID: "9677718153",
     SOURCE_DESCRIPTION: `${readableUrl}`,
    ASSIGNED_BY_ID: 14,
  };

  // Добавляем email, если он есть
  if (email && email.trim()) {
    FIELDS.EMAIL = [{ VALUE: email.trim(), VALUE_TYPE: 'WORK' }];
    console.log('📧 Добавляем email в контакт:', email);
  }

  if (existingContactId) {
    console.log('🔄 Обновление существующего контакта:', existingContactId);

    // Если контакт существует, но email не был сохранен ранее - обновим
    if (email && email.trim()) {
      try {
        await callBitrix('crm.contact.update', {
          id: existingContactId,
          FIELDS: {
            EMAIL: [{ VALUE: email.trim(), VALUE_TYPE: 'WORK' }]
          }
        });
        console.log('✅ Email добавлен к существующему контакту');
      } catch (error) {
        console.error('❌ Ошибка добавления email:', error);
      }
    }



    // await addContactComment(existingContactId);

    console.log('ℹ️ Добавлен комментарий о новом обращении');
    return existingContactId;
  } else {
    console.log('➕ Создание нового контакта');

  

    const result = await callBitrix('crm.contact.add', {
      FIELDS: FIELDS,
    });
    const newId = result.result;
    console.log('✅ Контакт создан:', newId);
    return newId;
  }
}