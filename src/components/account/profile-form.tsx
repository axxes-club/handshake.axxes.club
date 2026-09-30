"use client";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {authClient} from "@/lib/auth-client";
import {Alert,Button,Field,inputClass} from "@/components/ui";
export function ProfileForm({name}:{name:string}){
 const router=useRouter(),[value,setValue]=useState(name),[pending,setPending]=useState(false),[message,setMessage]=useState<{tone:"success"|"error";text:string}|null>(null);
 async function submit(e:React.FormEvent){e.preventDefault();setPending(true);setMessage(null);try{const {error}=await authClient.updateUser({name:value.trim()});if(error)setMessage({tone:"error",text:error.message??"Your profile could not be saved."});else{setMessage({tone:"success",text:"Profile updated."});router.refresh()}}catch{setMessage({tone:"error",text:"Your profile could not be saved. Try again."})}finally{setPending(false)}}
 return <form onSubmit={submit} className="card grid gap-5 p-6"><Field label="Display name" hint="This name is shared across your AXXES apps."><input required maxLength={200} autoComplete="name" value={value} onChange={e=>setValue(e.target.value)} className={inputClass}/></Field>{message&&<Alert tone={message.tone}>{message.text}</Alert>}<div><Button disabled={pending||!value.trim()||value.trim()===name} type="submit">{pending?"Saving…":"Save profile"}</Button></div></form>
}
