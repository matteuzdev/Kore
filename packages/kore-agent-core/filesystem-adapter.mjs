import fs from "node:fs/promises";
import path from "node:path";
import { validateOperations } from "./index.mjs";

function contained(root, rel) {
 const candidate=path.resolve(root,rel);
 if(candidate===root || !candidate.startsWith(root+path.sep)) throw new Error("Path outside workspace");
 return candidate;
}
async function verifyPath(root, relative) {
 const parts=relative.split("/");
 let at=root;
 for(const part of parts){
  at=path.join(at,part);
  try {const stat=await fs.lstat(at);if(stat.isSymbolicLink())throw new Error("Symlink path forbidden: "+relative)}
  catch(e){if(e.code!=="ENOENT")throw e}
 }
 return contained(root,relative);
}
export function createFilesystemAdapter(workspace){
 if(typeof workspace!=="string"||!workspace.trim())throw new Error("Workspace required");
 const root=path.resolve(workspace);
 return {
  async apply(input){
   const ops=validateOperations(input);
   const stat=await fs.lstat(root);
   if(!stat.isDirectory()||stat.isSymbolicLink())throw new Error("Invalid workspace");
   const changes=[];const journal=[];
   // Preflight every operation before changing anything.
   for(const op of ops){
    const file=await verifyPath(root,op.path);
    const previous=await fs.readFile(file).then(v=>({exists:true,data:v}),e=>{if(e.code==="ENOENT")return {exists:false};throw e});
    if(op.type==="read_file"&&!previous.exists)throw new Error("File not found: "+op.path);
    if(op.type==="delete_file"&&!previous.exists)throw new Error("Cannot delete missing file: "+op.path);
    changes.push({op,file,previous});
   }
   try{
    for(const {op,file,previous} of changes){
     // Revalidate to reduce risks from concurrent filesystem changes.
     await verifyPath(root,op.path);
     if(op.type==="read_file"){journal.push({type:op.type,path:op.path,content:previous.data.toString("utf8")});continue}
     if(op.type==="write_file"){
      await fs.mkdir(path.dirname(file),{recursive:true});
      await verifyPath(root,op.path);
      await fs.writeFile(file,op.content,{flag:"w"});
     }else await fs.unlink(file);
     journal.push({type:op.type,path:op.path});
    }
    return {applied:journal.length,results:journal};
   }catch(error){
    for(const {op,file,previous} of [...changes].reverse()){
     if(op.type==="read_file")continue;
     try{
      if(previous.exists){await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,previous.data)}
      else await fs.rm(file,{force:true});
     }catch{/* Do not conceal the original error */}
    }
    throw error;
   }
  }
 };
}
