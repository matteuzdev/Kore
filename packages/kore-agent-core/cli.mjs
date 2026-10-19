import fs from "node:fs/promises";
import path from "node:path";
import {generateProposal,runApprovedProposal} from "./index.mjs";
import {createFilesystemAdapter} from "./filesystem-adapter.mjs";

const [,,cmd,workspace,...rest]=process.argv;
const help="Usage: node packages/kore-agent-core/cli.mjs propose <workspace> <prompt> | apply <workspace> <proposal.json> --approve";
async function main(){
 if(!workspace || !["propose","apply"].includes(cmd))throw new Error(help);
 const root=path.resolve(workspace);
 if(cmd==="propose"){
  const prompt=rest.join(" ").trim();
  const apiKey=process.env.OPENAI_API_KEY;
  if(!apiKey)throw new Error("OPENAI_API_KEY is required in the environment");
  if(!prompt)throw new Error(help);
  const model={async generate({system,userRequest,context}){
   const res=await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${apiKey}`},
    body:JSON.stringify({model:process.env.KORE_MODEL||"gpt-4.1-mini",response_format:{type:"json_object"},messages:[{role:"system",content:system},{role:"user",content:JSON.stringify({request:userRequest,context})}]})
   });
   if(!res.ok)throw new Error(`Model request failed (HTTP ${res.status})`);
   const data=await res.json();
   if(typeof data.choices?.[0]?.message?.content!=="string")throw new Error("Empty model response");
   return data.choices[0].message.content;
  }};
  const proposal=await generateProposal({userRequest:prompt,model,context:"Create a standalone, accessible web UI. Avoid third-party dependencies when possible."});
  const target=path.join(root,"kore-proposal.json");
  await fs.writeFile(target,JSON.stringify(proposal,null,2),{flag:"wx"});
  console.log(`Proposal saved: ${target}\nReview the diff before applying.`);
 } else {
  const file=rest[0];
  if(!file||!rest.includes("--approve"))throw new Error("Apply requires a proposal filename and explicit --approve");
  const proposal=JSON.parse(await fs.readFile(path.resolve(file),"utf8"));
  const result=await runApprovedProposal(proposal,{approved:true,adapter:createFilesystemAdapter(root)});
  console.log(JSON.stringify(result,null,2));
 }
}
main().catch(error=>{console.error(error.message);process.exitCode=1});
