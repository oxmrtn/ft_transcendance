import React from 'react';

export default function LoginWrapper({ children }: { children: React.ReactNode }) {
return (
    <div className="flex bg-modal-bg backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-[0_0_30px] shadow-black/70">
      <div className="hidden w-2xs items-center justify-center border border-white/10 rounded-xl -m-px relative login-card-gradient overflow-hidden md:flex">
        <div className="flex gap-1 w-full absolute top-0 left-0 p-3 bg-black/40">
          <div className="h-3 w-3 bg-white/10 rounded-full"></div>
          <div className="h-3 w-3 bg-white/10 rounded-full"></div>
          <div className="h-3 w-3 bg-white/10 rounded-full"></div>
        </div>
        <p className="text-[5.5px]/[1.2] text-sub-text whitespace-pre font-mono">{`
00000000                 00000000000    00000000000000000000
00000000                 0000000000     00000000000 00000000
000000000               00000000000     00000000000  0000000
 000000000             00000000000      00000000000    00000
  00000000             0000000000       00000000000      000
   00000000           0000000000        00000000000        0
    00000000         00000000000         000000000000       
    00000000         0000000000           000000000000      
     00000000       0000000000              000000000000    
      00000000     00000000000               0000000000000  
      000000000   000000000000                 0000000000000
       00000000   00000000000                   000000000000
        0000000  000000000000           000       0000000000
        00000000000000000000            00000     0000000000
         000000000000000000             000000    0000000000
          0000000000000000              0000000   0000000000
          0000000000000000              000000000 0000000000
           00000000000000               00000000000000000000
            000000000000                                    
             0000000000                                     
             0000000000                                     
`}</p>
      </div>
      {children}
    </div>
  )
}
