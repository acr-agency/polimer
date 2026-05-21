// lib/bitrix24-service.ts

import { BITRIX_CONFIG, UF_FIELDS, cleanPhone } from './bitrix24';

// Функция для вызова API Bitrix24
async function callBitrix(method: string, params: Record<string, any> = {}) {
  const url = `${BITRIX_CONFIG.webhookUrl}${method}`;
  
  const formData = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value.toString());
  });

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  
  if (result.error) {
    console.error(`❌ Bitrix24 API error [${method}]:`, result);
    throw new Error(`Bitrix24 error: ${result.error_description || result.error}`);
  }
  
  return result;
}

// Поиск контакта по телефону через дубликаты
export async function findContactByPhone(phone: string): Promise<number | null> {
  try {
    const clean = cleanPhone(phone);
    console.log('🔍 Поиск контакта по телефону:', clean);
    
    const result = await callBitrix('crm.duplicate.findbycomm', {
      type: 'PHONE',
      'values[0]': clean,
      entity_type: 'CONTACT',
    });

    const contactId = result?.result?.CONTACT?.[0];
    console.log(contactId ? `✅ Контакт найден: ${contactId}` : 'ℹ️ Контакт не найден');
    return contactId || null;
  } catch (error) {
    console.error('❌ Ошибка поиска контакта:', error);
    return null;
  }
}

// Создание или обновление контакта
export async function upsertContact(
  name: string, 
  phone: string, 
  pageUrl: string,
  existingContactId: number | null = null
): Promise<number> {
  const fields = {
    NAME: name,
    PHONE: [{ 
      VALUE: cleanPhone(phone), 
      VALUE_TYPE: 'WORK' 
    }],
    SOURCE_ID: BITRIX_CONFIG.sourceId,
    SOURCE_DESCRIPTION: pageUrl,
    ASSIGNED_BY_ID: BITRIX_CONFIG.responsibleUserId,
  };

  if (existingContactId) {
    console.log('🔄 Обновление контакта:', existingContactId);
    const result = await callBitrix('crm.contact.update', {
      id: existingContactId,
      fields,
    });
    return existingContactId;
  } else {
    console.log('➕ Создание нового контакта');
    const result = await callBitrix('crm.contact.add', {
      fields,
    });
    return result.result;
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
  formId: string
): Promise<number> {
  console.log('💰 Создание сделки для контакта:', contactId);

  const fields = {
    TITLE: `Заявка с сайта ${name} ${phone}`,
    CONTACT_ID: contactId,
    SOURCE_ID: BITRIX_CONFIG.sourceId,
    SOURCE_DESCRIPTION: pageUrl,
    ASSIGNED_BY_ID: BITRIX_CONFIG.responsibleUserId,
    [UF_FIELDS.message]: message || '',
    [UF_FIELDS.agreement]: agreement ? 'Да' : 'Нет',
    COMMENTS: `Заявка с сайта. Страница: ${pageUrl}\nФорма: ${formId}`,
  };

  // Добавляем поле ID формы только если оно сконфигурировано
  if (UF_FIELDS.formId !== 'UF_CRM_XXXXXXXXXX') {
    fields[UF_FIELDS.formId] = formId;
  }

  const result = await callBitrix('crm.deal.add', { fields });
  console.log('✅ Сделка создана:', result.result);
  return result.result;
}