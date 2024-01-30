import request from '@/utils/request';

// 发送短信验证码
export function smsCode(phonenumber: string) {
  return request({
    url: '/resource/sms/code/' + phonenumber,
    method: 'get'
  });
}
