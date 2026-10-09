import {isIP} from 'node:net';
import {admissionTransaction,admit,AdmissionError} from './security/admission.mjs';
/** Only the Google LB's appended client/tail pair may identify a caller.
 * Requires restricted Cloud Run ingress so a direct caller cannot manufacture the tail. */
export function signupClientAddress(headers:Headers):string|null {
 const chain=(headers.get('x-forwarded-for')??'').split(',').map(x=>x.trim());
 const trusted=(process.env.SECURITY_TRUSTED_LB_IPS??'136.81.161.193').split(',').map(x=>x.trim());
 return chain.length>=2&&trusted.includes(chain.at(-1)!)&&isIP(chain.at(-2)!)?chain.at(-2)!:null;
}
export async function admitSignup(db:Parameters<typeof admissionTransaction>[0],headers:Headers,email:string){
 const client=signupClientAddress(headers);if(!client)throw new AdmissionError(503);
 return admissionTransaction(db,async clientDb=>{
 await admit(clientDb,{service:'handshake',scope:'invite-enrollment',subject:'service',limit:600});
 await admit(clientDb,{service:'handshake',scope:'enrollment-client',subject:client,limit:10});
 await admit(clientDb,{service:'handshake',scope:'enrollment-email',subject:email.trim().toLowerCase(),limit:10});
 });
}
