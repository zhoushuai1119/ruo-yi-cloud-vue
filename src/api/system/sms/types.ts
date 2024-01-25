/**
 * 发送短信验证码返回
 */
export interface SmsCodeResult {
  success: boolean;
  data?: any;
  configId?: string;
}
