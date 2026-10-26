/* Guided instruction traces for the ECE 385 modified SLC-3 datapath.
   These are hardware-path explanations, not an emulation of user RTL or clocked RAM. */
(() => {
  const root = document.getElementById('lab5-workbench');
  if (!root || root.dataset.initialized === 'true') return;
  root.dataset.initialized = 'true';
  const $ = (sel) => root.querySelector(sel);
  const $$ = (sel) => [...root.querySelectorAll(sel)];
  const step = (phase,formula,explanation,nodes,wires,signals) => ({phase,formula,explanation,nodes,wires,signals});
  const fetch = [
    step('FETCH / ADDRESS','MAR ← PC',
      'The 16-bit program counter drives the shared CPU bus through GatePC. MAR captures the address, which will be sent to the on-chip memory subsystem.',
      ['PC','MAR'],['gate-pc','bus','bus-mar'],['gate_pc','ld_mar']),
    step('FETCH / MEMORY','MDR ← M[MAR]',
      'The CPU addresses block RAM through MAR and cpu_to_io. The data returning from memory is latched in MDR. The Lab 5 FSM includes additional wait states because RAM has no ready (R) handshake.',
      ['MAR','IO','BRAM','MIO','MDR'],['mar-io','io-bram','mio-io','io-mdr'],['sram_mem_ena','ld_mdr']),
    step('FETCH / INSTRUCTION','IR ← MDR ; PC ← PC + 1',
      'GateMDR puts the fetched instruction on the CPU bus for IR. In the fetch sequence, the PC incrementer and PCMUX prepare the next sequential instruction address.',
      ['MDR','IR','PC','INC','PCMUX'],['gate-mdr','bus','bus-ir','pc-increment','inc-pcmux','pc-mux-pc'],['gate_mdr','ld_ir','ld_pc','pcmux[1:0]']),
    step('DECODE / CONTROL','control.sv ← IR[15:12]',
      'The instruction sequencer decodes the opcode, register selectors, immediate fields and condition masks. It generates the specific bus gates, multiplexor controls and register load enables used by execution.',
      ['IR','CONTROL'],['ir-decode'],['decode / next_state'])
  ];
  const commonAddr = ['ADDR1','ADDR2','ADDR','SEXT6','REG','MAR'];
  const traces = {
    fetch:{name:'Instruction fetch',steps:[...fetch]},
    add:{name:'ADD immediate',steps:[...fetch,
      step('EXECUTE / ALU','DR ← SR1 + SEXT(imm5)',
        'The register file supplies SR1 to ALU input A. The sign-extended 5-bit immediate is selected by SR2MUX for input B. ALUK selects ADD; GateALU drives the result to the register file and NZP logic.',
        ['IR','SEXT5','REG','SR2MUX','ALU','NZP'],['ir-sext','ir-immediate','sext5-sr2','reg-alu-a','sr2-alu','gate-alu','bus','bus-reg','alu-nzp'],['sr2mux_sel','aluk = ADD','gate_alu','ld_reg','ld_cc'])
    ]},
    and:{name:'AND register',steps:[...fetch,
      step('EXECUTE / ALU','DR ← SR1 AND SR2',
        'Two register outputs feed the ALU. SR2MUX chooses the second register rather than an immediate. ALUK selects the bitwise AND function. The result is gated to DR and updates NZP.',
        ['REG','SR2MUX','ALU','NZP'],['reg-alu-a','reg-sr2','sr2-alu','gate-alu','bus','bus-reg','alu-nzp'],['sr2mux_sel','aluk = AND','gate_alu','ld_reg','ld_cc'])
    ]},
    not:{name:'NOT',steps:[...fetch,
      step('EXECUTE / ALU','DR ← NOT(SR1)',
        'The 16-bit ALU inverts the bits of SR1. SR2 is not used for this operation. GateALU drives the result to DR, and the condition-code logic records its sign.',
        ['REG','ALU','NZP'],['reg-alu-a','gate-alu','bus','bus-reg','alu-nzp'],['aluk = NOT','gate_alu','ld_reg','ld_cc'])
    ]},
    ldr:{name:'LDR (register + offset)',steps:[...fetch,
      step('LDR / EFFECTIVE ADDRESS','MAR ← BaseR + SEXT(offset6)',
        'ADDR1MUX selects BaseR from the register file; ADDR2MUX selects sign-extended offset6. The address adder computes the effective address and the address-path gate drives it onto the bus for MAR.',
        ['REG','SEXT6','ADDR1','ADDR2','ADDR','MAR'],['reg-addr1','ir-sext','sext6-addr2','addr1-adder','addr2-adder','addr-gate','gate-mar-mux','bus','bus-mar'],['addr1mux','addr2mux[1:0]','gate_mar','ld_mar']),
      step('LDR / MEMORY READ','MDR ← M[MAR]',
        'cpu_to_io routes an ordinary address to BRAM, or a read at xFFFF to the physical switch input. The memory data is captured in MDR after the required RAM access state(s).',
        ['MAR','IO','BRAM','BOARD','MIO','MDR'],['mar-io','io-bram','io-board','mio-io','io-mdr'],['sram_mem_ena','ld_mdr']),
      step('LDR / WRITEBACK','DR ← MDR ; NZP ← sign(DR)',
        'MDR drives the CPU bus and the destination register latches the loaded word. The NZP condition codes are updated based on the loaded value.',
        ['MDR','REG','NZP'],['gate-mdr','bus','bus-reg','control-nzp'],['gate_mdr','ld_reg','ld_cc'])
    ]},
    str:{name:'STR (register + offset)',steps:[...fetch,
      step('STR / EFFECTIVE ADDRESS','MAR ← BaseR + SEXT(offset6)',
        'Address selection is the same as LDR: BaseR and sign-extended offset6 enter the address adder, and MAR captures the effective address.',
        ['REG','SEXT6','ADDR1','ADDR2','ADDR','MAR'],['reg-addr1','ir-sext','sext6-addr2','addr1-adder','addr2-adder','addr-gate','gate-mar-mux','bus','bus-mar'],['addr1mux','addr2mux[1:0]','gate_mar','ld_mar']),
      step('STR / STORE DATA','MDR ← SR',
        'The source register supplies the word to be stored. In this modified CPU, datapath gating places register data onto the bus so MDR can capture it.',
        ['REG','ALU','MDR'],['reg-alu-a','gate-alu','bus','bus-mdr'],['aluk = PASS','gate_alu','ld_mdr']),
      step('STR / MEMORY WRITE','M[MAR] ← MDR',
        'The CPU asserts memory write for the word in MDR. A write at xFFFF is redirected by cpu_to_io to the board HEX display instead of ordinary BRAM.',
        ['MDR','MAR','IO','BRAM','BOARD'],['mdr-mio','mar-io','mio-io','io-bram','io-board'],['sram_mem_ena','sram_wr_ena'])
    ]},
    br:{name:'BR (conditional)',steps:[...fetch,
      step('BR / CONDITION CHECK','BEN ← IR[11:9] ∩ NZP',
        'The branch-enable logic matches the condition bits in IR with the saved N, Z and P status. Branches do not overwrite the register file.',
        ['IR','CONTROL','NZP'],['ir-decode','control-nzp','nzp-control'],['ld_ben']),
      step('BR / PC SELECT','if BEN: PC ← PC + SEXT(offset9)',
        'If the condition matches, ADDR1MUX chooses the incremented PC and ADDR2MUX chooses offset9. The address adder feeds PCMUX, which loads the branch target into the PC; otherwise sequential execution continues.',
        ['PC','IR','SEXT9','ADDR1','ADDR2','ADDR','PCMUX'],['pc-addr1','ir-sext','sext9-addr2','addr1-adder','addr2-adder','addr-pcmux','pc-mux-pc'],['addr1mux','addr2mux[1:0]','pcmux[1:0]','ld_pc (if BEN)'])
    ]},
    jmp:{name:'JMP',steps:[...fetch,
      step('JMP / PC SELECT','PC ← BaseR',
        'The ALU pass-through path puts BaseR onto the internal bus. PCMUX selects the bus value and loads PC. JMP is unconditional and does not alter NZP.',
        ['REG','ALU','PCMUX','PC'],['reg-alu-a','gate-alu','bus','bus-pc','pc-mux-pc'],['sr1mux','aluk = PASS','gate_alu','pcmux[1:0]','ld_pc'])
    ]},
    jsr:{name:'JSR',steps:[...fetch,
      step('JSR / LINK REGISTER','R7 ← PC',
        'The already-incremented PC is the return address. GatePC drives it to the destination register input, and DRMUX selects R7.',
        ['PC','REG'],['gate-pc','bus','bus-reg'],['gate_pc','drmux','ld_reg']),
      step('JSR / SUBROUTINE TARGET','PC ← PC + SEXT(offset11)',
        'The address path adds the signed 11-bit PC-relative offset to the current PC. PCMUX selects the address-adder result and loads the subroutine entry point.',
        ['PC','IR','SEXT11','ADDR1','ADDR2','ADDR','PCMUX'],['pc-addr1','ir-sext','sext11-addr2','addr1-adder','addr2-adder','addr-pcmux','pc-mux-pc'],['addr1mux','addr2mux[1:0]','pcmux[1:0]','ld_pc'])
    ]},
    pause:{name:'PAUSE / Continue',steps:[...fetch,
      step('PAUSE / LED CUE','LED register ← IR[11:0]',
        'PAUSE stores the instruction’s 12-bit LED vector for display on the board. The high two bits act as optional I/O cues defined by the test program; they are not CPU control flags.',
        ['IR','CONTROL','BOARD'],['ir-decode','ir-pause','io-board'],['ld_led']),
      step('PAUSE / HALT STATE','Wait until Continue is pressed',
        'The control FSM remains in the pause state. The LEDs keep displaying the cue while the user views HEX output or adjusts the board switches. Press Continue to release this PAUSE.',
        ['CONTROL','BOARD'],['control-mem','io-board'],['continue_i = 0']),
      step('PAUSE / RESUME','continue_i → next fetch',
        'A Continue press advances past this PAUSE. The next PAUSE requires another press, so consecutive pauses cannot all be released by one held signal.',
        ['CONTROL','PC'],['pc-increment'],['continue_i = 1'])
    ]}
  };
  const modules = {
    PC:['Program Counter','cpu.sv','16-bit counter. Fetch gates PC onto the internal bus; the PC incrementer and PCMUX select the next sequential or control-flow address.','ld_pc · gate_pc · pcmux'],
    INC:['PC + 1 incrementer','cpu.sv','Dedicated increment path used to move from a fetched instruction to the next sequential address.','pcmux[1:0]'],
    PCMUX:['PC multiplexer','cpu.sv','Chooses the next PC source: the incrementer, computed target or register-based path for control flow.','pcmux[1:0] · ld_pc'],
    ADDR:['Address adder','cpu.sv','Adds the selected ADDR1 and ADDR2 values. This supports PC-relative branches/subroutines and BaseR + offset addressing.','addr1mux · addr2mux'],
    ADDR1:['ADDR1MUX','cpu.sv','Selects either PC or a base register for the left input of the address adder.','addr1mux'],
    ADDR2:['ADDR2MUX','cpu.sv','Selects a zero or sign-extended instruction offset for the right input of the address adder.','addr2mux[1:0]'],
    SEXT11:['SEXT PCoffset11','signextend.sv','Extends the 11-bit signed offset in the JSR instruction to a 16-bit two’s-complement value.','IR[10:0]'],
    SEXT9:['SEXT PCoffset9','signextend.sv','Extends the 9-bit branch offset for PC-relative conditional branching.','IR[8:0]'],
    SEXT6:['SEXT offset6','signextend.sv','Extends BaseR-relative load and store offsets before address addition.','IR[5:0]'],
    SEXT5:['SEXT imm5','signextend.sv','Extends the immediate operand for ADD and AND. SR2MUX selects it in immediate mode.','IR[4:0] · sr2mux_sel'],
    IR:['Instruction Register','cpu.sv','Holds the fetched 16-bit instruction. Its opcode and operand fields drive the control FSM, registers, sign extension and mux selection.','gate_mdr · ld_ir'],
    CONTROL:['Instruction sequencer / FSM','control.sv','Controls sequencing across FETCH, DECODE, EXECUTE, memory access, and PAUSE. Its signals gate the shared bus and load PC, IR, MAR, MDR, registers, condition codes and LEDs.','ld_* · gate_* · aluk · pcmux'],
    REG:['Eight 16-bit registers','regs.sv','The 8×16 register file has two source outputs and a controlled destination write. The link register R7 receives the return PC for JSR.','sr1mux · drmux · ld_reg'],
    SR2MUX:['Second ALU operand mux','cpu.sv','Selects SR2 or SEXT(imm5) as the ALU’s B operand.','sr2mux_sel'],
    ALU:['16-bit Arithmetic Logic Unit','alu.sv','Computes ADD, AND, NOT or passes SR1 through. GateALU is used for driving its result onto the shared CPU bus.','aluk[1:0] · gate_alu'],
    NZP:['Condition codes and BEN','cpu.sv / control.sv','N, Z and P describe the signed result of register-writing instructions. Branch-enable logic compares them to the BR instruction mask.','ld_cc · ld_ben'],
    MDR:['Memory Data Register','cpu.sv','Buffers 16-bit data between the internal CPU bus and the memory subsystem. It holds fetched instructions, loaded data, and words being stored.','ld_mdr · gate_mdr'],
    MAR:['Memory Address Register','cpu.sv','Holds the address for instruction fetches and LDR/STR memory accesses. The effective address is routed through the datapath before being latched.','ld_mar'],
    MIO:['Memory-data input mux','cpu.sv','Chooses whether MDR takes data from the CPU bus for a store or returns data from the memory and I/O subsystem.','MIO.EN · ld_mdr'],
    IO:['Memory-mapped I/O adapter','cpu_to_io.sv (provided)','A read of address xFFFF maps to switch inputs; a write to xFFFF updates the HEX output. Regular addresses pass through to on-chip BRAM.','sram_mem_ena · sram_wr_ena'],
    BRAM:['On-chip memory','test_memory.sv / FPGA BRAM','Stores instruction words and data. The provided synchronous RAM has no ready/R signal, so the FSM allows additional memory-access cycles.','sram_mem_ena · sram_wr_ena'],
    BOARD:['Urbana board peripherals','processor_top.sv','Physical run, reset and continue controls, switch inputs, HEX display outputs and PAUSE LED cues connect through the top-level design.','run_i · continue_i · sw_i · led_o']
  };
  let traceName='fetch',position=0,inspection='PC',timer=null;
  const visible=(v)=>String(v);
  function stop(){if(timer!==null){clearInterval(timer);timer=null;}}
  function inspect(id){
    const d=modules[id];if(!d)return;
    inspection=id;
    $('[data-module-id]').textContent=id;
    $('[data-module-title]').textContent=d[0];
    $('[data-module-description]').textContent=d[2] + ' Related signals: ' + d[3] + '.';
    $('[data-module-source]').textContent='MODULE  /  '+d[1];
    $$('[data-module]').forEach(n=>n.classList.toggle('selected',n.dataset.module===id));
  }
  function draw(){
    const trace=traces[traceName];
    const s=trace.steps[position];
    $('[data-trace-title]').textContent=trace.name.toUpperCase();
    $('[data-step-count]').textContent='STEP '+(position+1)+' / '+trace.steps.length;
    $('[data-current-phase]').textContent=s.phase;
    $('[data-current-formula]').textContent=s.formula;
    $('[data-current-explanation]').textContent=s.explanation;
    $$('[data-module]').forEach(n=>n.classList.toggle('active',s.nodes.includes(n.dataset.module)));
    $$('[data-wire]').forEach(w=>w.classList.toggle('active',s.wires.includes(w.dataset.wire)));
    const tags=$('[data-signal-tags]');tags.replaceChildren();
    s.signals.forEach(sig=>{const label=document.createElement('span');label.textContent=sig;tags.appendChild(label);});
    const timeline=$('[data-timeline]');timeline.replaceChildren();
    trace.steps.forEach((v,i)=>{
      const b=document.createElement('button');b.type='button';b.className=i===position?'active':i<position?'done':'';
      b.setAttribute('aria-label','Show '+v.phase);b.setAttribute('aria-current',i===position?'step':'false');
      b.title=v.phase;b.addEventListener('click',()=>{stop();position=i;draw();});
      timeline.append(b);
    });
    $('[data-back]').disabled=position===0;
    $('[data-next]').disabled=position===trace.steps.length-1;
    $('[data-next]').innerHTML=(traceName==='pause' && position===trace.steps.length-2)?'Continue <span aria-hidden="true">→</span>':'Next step <span aria-hidden="true">→</span>';
    $('[data-play]').textContent=timer===null?'Play trace':'Pause';
    $('[data-play]').setAttribute('aria-pressed',String(timer!==null));
    inspect(inspection);
  }
  function advance(){
    const steps=traces[traceName].steps;
    if(position<steps.length-1){position++;draw();}
    if(position===steps.length-1)stop();
    if(timer===null)draw();
  }
  function select(name){stop();traceName=traces[name]?name:'fetch';position=0;$('[data-trace]').value=traceName;draw();}
  $('[data-trace]').addEventListener('change',e=>select(e.target.value));
  $('[data-back]').addEventListener('click',()=>{stop();position=Math.max(0,position-1);draw();});
  $('[data-next]').addEventListener('click',()=>{stop();advance();});
  $('[data-reset]').addEventListener('click',()=>select(traceName));
  $('[data-play]').addEventListener('click',()=>{
    if(timer!==null){stop();draw();return;}
    const trace=traces[traceName];
    if(position===trace.steps.length-1)position=0;
    timer=setInterval(()=>{
      if(traceName==='pause'&&position===trace.steps.length-2){stop();draw();return;}
      advance();
    },1450);
    draw();
  });
  $$('[data-module]').forEach(n=>{
    const open=()=>inspect(n.dataset.module);
    n.addEventListener('click',open);
    n.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();draw();}});
  select('fetch');
})();
