import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SmsCodeResult } from '@/api/system/sms/types';

// 发送短信验证码
export function smsCode(phonenumber: string): AxiosPromise<SmsCodeResult> {
  return request({
    url: '/resource/sms/code/' + phonenumber,
    method: 'get'
  });
}
