import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {createFilesystemAdapter} from "./filesystem-adapter.mjs";
import {createChangeProposal,runApprovedProposal} from "./index.mjs";
const dir=await fs.mkdtemp(path.join(os.tmpdir(),"kore-agent-"));
test("approved proposal writes and reads local file",async()=>{
 const adapter=createFilesystemAdapter(dir);
 await runApprovedProposal(createChangeProposal({request:"create app",operations:[{type:"write_file",path:"src/page.html",content:"hello"}]}),{approved:true,adapter});
 assert.equal(await fs.readFile(path.join(dir,"src/page.html"),"utf8"),"hello");
 const r=await adapter.apply([{type:"read_file",path:"src/page.html"}]);assert.equal(r.results[0].content,"hello");
});
test("rejects symlink pointing outside workspace",async t=>{
 if(process.platform==="win32"){t.skip("Windows symlinks require elevated privileges");return}
 await fs.symlink(os.tmpdir(),path.join(dir,"outside"));
 await assert.rejects(()=>createFilesystemAdapter(dir).apply([{type:"write_file",path:"outside/leak",content:"x"}]),/Symlink/);
});
test("preflight prevents partial writes",async()=>{
 await assert.rejects(()=>createFilesystemAdapter(dir).apply([{type:"write_file",path:"file.txt",content:"x"},{type:"delete_file",path:"missing.txt"}]),/missing file/);
 await assert.rejects(()=>fs.access(path.join(dir,"file.txt")));
});
