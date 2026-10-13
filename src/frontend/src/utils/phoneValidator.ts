/**
 * Utility kiểm tra và chuẩn hóa số điện thoại Việt Nam (10 chữ số)
 * Các đầu số hợp lệ của các nhà mạng viễn thông Việt Nam (Viettel, VinaPhone, MobiFone, Vietnamobile, Gmobile, I-Telecom, Wintel):
 * - 03x: 032 - 039
 * - 05x: 052, 055 - 059
 * - 07x: 070, 076 - 079
 * - 08x: 081 - 089
 * - 09x: 090 - 099
 */

export interface PhoneValidationResult {
  isValid: boolean;
  error: string;
  normalizedPhone: string;
}

export function validateVietnamesePhone(phone: string): PhoneValidationResult {
  const trimmed = (phone || '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Vui lòng nhập số điện thoại',
      normalizedPhone: '',
    };
  }

  // Bỏ khoảng trắng, dấu gạch ngang, dấu chấm, dấu ngoặc
  let clean = trimmed.replace(/[\s.\-()]/g, '');

  // Nếu người dùng nhập định dạng quốc tế +84 hoặc 84 thì chuyển về 0
  if (clean.startsWith('+84')) {
    clean = '0' + clean.slice(3);
  } else if (clean.startsWith('84') && clean.length === 11) {
    clean = '0' + clean.slice(2);
  }

  // Kiểm tra chỉ chứa ký tự số
  if (!/^\d+$/.test(clean)) {
    return {
      isValid: false,
      error: 'Số điện thoại chỉ được chứa các chữ số',
      normalizedPhone: clean,
    };
  }

  // Kiểm tra độ dài đúng 10 số
  if (clean.length !== 10) {
    return {
      isValid: false,
      error: `Số điện thoại phải có đúng 10 chữ số (hiện tại có ${clean.length} số)`,
      normalizedPhone: clean,
    };
  }

  // Kiểm tra đầu số Việt Nam (03, 05, 07, 08, 09)
  const vnPhoneRegex = /^(03|05|07|08|09)\d{8}$/;
  if (!vnPhoneRegex.test(clean)) {
    return {
      isValid: false,
      error: 'Số điện thoại phải là đầu số hợp lệ của Việt Nam (03, 05, 07, 08, 09)',
      normalizedPhone: clean,
    };
  }

  return {
    isValid: true,
    error: '',
    normalizedPhone: clean,
  };
}

/**
 * Kiểm tra xem chuỗi có phải là email hay số điện thoại (dành cho ô đăng nhập dùng chung)
 */
export function validateLoginIdentifier(value: string): {
  type: 'email' | 'phone';
  isValid: boolean;
  error: string;
  normalizedValue: string;
} {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return {
      type: 'email',
      isValid: false,
      error: 'Vui lòng nhập email hoặc số điện thoại',
      normalizedValue: '',
    };
  }

  // Nếu chứa ký tự '@' thì kiểm tra theo dạng email
  if (trimmed.includes('@')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(trimmed);
    return {
      type: 'email',
      isValid: isEmailValid,
      error: isEmailValid ? '' : 'Định dạng email không hợp lệ (Ví dụ: name@example.com)',
      normalizedValue: trimmed,
    };
  }

  // Nếu không chứa '@', coi là số điện thoại và kiểm tra số điện thoại VN 10 số
  const phoneCheck = validateVietnamesePhone(trimmed);
  return {
    type: 'phone',
    isValid: phoneCheck.isValid,
    error: phoneCheck.error,
    normalizedValue: phoneCheck.normalizedPhone,
  };
}
