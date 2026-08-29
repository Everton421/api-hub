import crypto from "node:crypto";

export class GenerateMlCode{
     private base64URLEncode(buffer: Buffer): string {
       return buffer.toString("base64")
           .replace(/\+/g, "-")
           .replace(/\//g, "_")
           .replace(/=+$/, "");
   }
   
       generateCodeVerifier(): string {
       const bytes = crypto.randomBytes(32);
       return this.base64URLEncode(bytes);
   }
   
       generateCodeChallenge(verifier: string): string {
       const hash = crypto.createHash("sha256").update(verifier).digest();
       return this.base64URLEncode(hash);
   }

}