import { useState } from "react";

// ════════════════════════════════════════════════
// 데이터
// ════════════════════════════════════════════════
const STUDENTS = [
  { id:0,  name:"김민준", cls:"A", course:"중급 문법",   grade:"중등 2학년", phone:"010-1234-5678", score:95, attend:91,  rank:1,  pass:4, status:"ok"   },
  { id:1,  name:"이서연", cls:"A", course:"중급 문법",   grade:"중등 1학년", phone:"010-2345-6789", score:88, attend:83,  rank:4,  pass:3, status:"ok"   },
  { id:2,  name:"박지호", cls:"A", course:"초급 회화",   grade:"초등 6학년", phone:"010-3456-7890", score:72, attend:75,  rank:11, pass:2, status:"warn" },
  { id:3,  name:"최유나", cls:"A", course:"고급 독해",   grade:"고등 1학년", phone:"010-4567-8901", score:91, attend:100, rank:2,  pass:5, status:"ok"   },
  { id:4,  name:"정수현", cls:"A", course:"기초 파닉스", grade:"초등 4학년", phone:"010-5678-9012", score:63, attend:75,  rank:16, pass:1, status:"warn" },
  { id:5,  name:"임하은", cls:"B", course:"중급 문법",   grade:"중등 3학년", phone:"010-6789-0123", score:94, attend:100, rank:1,  pass:5, status:"ok"   },
  { id:6,  name:"조성민", cls:"B", course:"초급 회화",   grade:"중등 1학년", phone:"010-7890-1234", score:55, attend:67,  rank:18, pass:0, status:"warn" },
  { id:7,  name:"한채원", cls:"B", course:"중급 문법",   grade:"중등 2학년", phone:"010-8901-2345", score:82, attend:83,  rank:6,  pass:3, status:"ok"   },
  { id:8,  name:"오준혁", cls:"B", course:"초급 회화",   grade:"초등 6학년", phone:"010-9012-3456", score:76, attend:75,  rank:9,  pass:2, status:"ok"   },
  { id:9,  name:"남현우", cls:"C", course:"수능 영어",   grade:"고등 2학년", phone:"010-0123-4567", score:93, attend:100, rank:1,  pass:5, status:"ok"   },
  { id:10, name:"고민지", cls:"C", course:"고급 독해",   grade:"고등 1학년", phone:"010-1234-0000", score:96, attend:100, rank:1,  pass:5, status:"ok"   },
  { id:11, name:"전태양", cls:"C", course:"고급 독해",   grade:"고등 1학년", phone:"010-2345-0000", score:84, attend:83,  rank:5,  pass:3, status:"ok"   },
];

const AVATAR_COLORS = [
  {bg:"#E6F1FB",c:"#0C447C"},{bg:"#EAF3DE",c:"#27500A"},
  {bg:"#FAEEDA",c:"#633806"},{bg:"#FBEAF0",c:"#72243E"},
  {bg:"#E1F5EE",c:"#085041"},
];

const MONTH_ATT = [
  [1,1,1,1,1,0,1,1,1,1,1,1],[1,1,0,1,1,1,1,0,1,1,1,1],
  [1,1,1,0,1,1,0,1,1,0,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,1,1,0,1,1,1,0,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],
  [0,1,1,0,1,1,1,0,1,1,0,1],[1,1,1,1,0,1,1,1,1,0,1,1],
  [1,0,1,1,1,1,0,1,1,1,1,0],[1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1],[1,1,0,1,1,1,0,1,1,1,1,1],
];

const SCORE_HISTORY = [
  {wk:"2월 1주",s:72},{wk:"2월 2주",s:75},{wk:"2월 3주",s:79},
  {wk:"2월 4주",s:82},{wk:"3월 1주",s:85},{wk:"3월 2주",s:88},{wk:"3월 3주",s:95},
];

const PROGRESS_LABELS = ["내신 내용 숙지","해석","어휘","독해","문제 풀이","어법"];

const HOMEWORK_FILES = [
  {id:1, title:"3월 3주차 문법 과제",     subj:"문법", cls:"A",   size:"1.2MB", date:"2026.03.17", due:"3월 24일", dl:18, isNew:true,  desc:"관계대명사 & 분사구문 연습 15문항"},
  {id:2, title:"3월 3주차 독해 지문 모음", subj:"독해", cls:"전체",size:"3.4MB", date:"2026.03.17", due:"3월 24일", dl:42, isNew:true,  desc:"이번 주 수업 지문 + 해석 포함"},
  {id:3, title:"수능 기출 어휘 리스트 Vol.3",subj:"어휘",cls:"C", size:"0.8MB", date:"2026.03.14", due:"3월 21일", dl:29, isNew:false, desc:"2020~2025 수능 빈출 어휘 600개"},
  {id:4, title:"3월 2주차 문법 정답지",    subj:"문법", cls:"전체",size:"0.5MB", date:"2026.03.10", due:null,       dl:55, isNew:false, desc:"3월 2주차 과제 정답 및 해설"},
  {id:5, title:"듣기 훈련 스크립트 3월",   subj:"듣기", cls:"B",   size:"2.1MB", date:"2026.03.08", due:"3월 21일", dl:22, isNew:false, desc:"수능 유형 듣기 대본 20문항"},
  {id:6, title:"3월 1주차 독해 과제",      subj:"독해", cls:"A",   size:"1.8MB", date:"2026.03.03", due:null,       dl:31, isNew:false, desc:"장문독해 3지문 + 세부내용 파악"},
  {id:7, title:"수능 실전 모의고사 1회",   subj:"수능", cls:"C",   size:"4.2MB", date:"2026.03.01", due:"3월 20일", dl:19, isNew:false, desc:"45문항 실전 모의 + 마킹시트"},
  {id:8, title:"어휘 테스트 시트 3월",     subj:"어휘", cls:"전체",size:"0.3MB", date:"2026.02.28", due:null,       dl:61, isNew:false, desc:"월간 누적 어휘 자가 테스트 시트"},
];

// ════════════════════════════════════════════════
// 공통 컴포넌트
// ════════════════════════════════════════════════
function Avatar({ name, idx, size=32 }) {
  const c = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return <div style={{width:size,height:size,borderRadius:"50%",background:c.bg,color:c.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:500,flexShrink:0}}>{name.slice(0,2)}</div>;
}

function Badge({ label, type="gray" }) {
  const map = {blue:{bg:"#E6F1FB",c:"#0C447C"},green:{bg:"#EAF3DE",c:"#27500A"},amber:{bg:"#FAEEDA",c:"#633806"},red:{bg:"#FCEBEB",c:"#791F1F"},gray:{bg:"#F1EFE8",c:"#5F5E5A"},purple:{bg:"#EEEDFE",c:"#3C3489"}};
  const s = map[type]||map.gray;
  return <span style={{display:"inline-block",fontSize:10,padding:"2px 8px",borderRadius:99,fontWeight:500,background:s.bg,color:s.c}}>{label}</span>;
}

function KpiCard({ label, value, sub, valueColor }) {
  return (
    <div style={{background:"#F1EFE8",borderRadius:8,padding:"10px 12px"}}>
      <div style={{fontSize:11,color:"#888780",marginBottom:4}}>{label}</div>
      <div style={{fontSize:22,fontWeight:500,color:valueColor||"#2C2C2A"}}>{value}</div>
      <div style={{fontSize:11,color:"#888780",marginTop:2}}>{sub}</div>
    </div>
  );
}

function SuccessBox({ msg }) {
  if (!msg) return null;
  return <div style={{background:"#EAF3DE",border:"0.5px solid #97C459",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#27500A",display:"flex",alignItems:"center",gap:8,marginBottom:16}}>✓ {msg}</div>;
}

function SectionTitle({ children }) {
  return <div style={{fontSize:12,fontWeight:500,color:"#888780",marginBottom:10,letterSpacing:"0.03em"}}>{children}</div>;
}

function Card({ children, mb=12 }) {
  return <div style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:12,padding:"1rem 1.25rem",marginBottom:mb}}>{children}</div>;
}

function BtnPrimary({ onClick, children, style={} }) {
  return <button onClick={onClick} style={{fontSize:13,padding:"8px 18px",borderRadius:8,cursor:"pointer",border:"none",background:"#185FA5",color:"#E6F1FB",fontWeight:500,...style}}>{children}</button>;
}

function BtnSecondary({ onClick, children, style={} }) {
  return <button onClick={onClick} style={{fontSize:13,padding:"8px 14px",borderRadius:8,cursor:"pointer",border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",...style}}>{children}</button>;
}

function ClassFilter({ value, onChange }) {
  return (
    <div style={{display:"flex",gap:6}}>
      {["all","A","B","C"].map(v => (
        <button key={v} onClick={()=>onChange(v)} style={{fontSize:12,padding:"5px 14px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:value===v?"#888780":"#D3D1C7",background:value===v?"#F1EFE8":"transparent",color:value===v?"#2C2C2A":"#888780",fontWeight:value===v?500:400}}>
          {v==="all"?"전체":v+"반"}
        </button>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════
// 대시보드
// ════════════════════════════════════════════════
function Dashboard({ onSelectStudent }) {
  const [filterCls, setFilterCls]       = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch]             = useState("");
  const clsColor = {A:"blue",B:"green",C:"amber"};

  const filtered = STUDENTS.filter(s =>
    (filterCls==="all"||s.cls===filterCls) &&
    (filterStatus==="all"||s.status===filterStatus) &&
    (!search||s.name.includes(search))
  );

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
        <KpiCard label="전체 학생"     value={`${STUDENTS.length}명`} sub="3개 반"/>
        <KpiCard label="평균 출석률"   value={`${Math.round(STUDENTS.reduce((a,b)=>a+b.attend,0)/STUDENTS.length)}%`} sub="이번 달"/>
        <KpiCard label="단어시험 평균" value={`${Math.round(STUDENTS.reduce((a,b)=>a+b.score,0)/STUDENTS.length)}점`} sub="이번 주"/>
        <KpiCard label="주의 학생"     value={`${STUDENTS.filter(s=>s.status==="warn").length}명`} sub="관리 필요" valueColor="#E24B4A"/>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <ClassFilter value={filterCls} onChange={setFilterCls}/>
        <button onClick={()=>setFilterStatus(filterStatus==="warn"?"all":"warn")} style={{fontSize:12,padding:"5px 14px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:filterStatus==="warn"?"#F09595":"#D3D1C7",background:filterStatus==="warn"?"#FCEBEB":"transparent",color:filterStatus==="warn"?"#791F1F":"#888780"}}>주의 학생만</button>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="이름 검색..." style={{fontSize:13,padding:"5px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",background:"white",color:"#2C2C2A",flex:1,minWidth:120}}/>
      </div>
      <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#F1EFE8"}}>
              {["#","이름","반","출석률","단어시험","등수","상태",""].map((h,i)=>(
                <th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s,i)=>(
              <tr key={s.id} style={{borderBottom:"0.5px solid #D3D1C7",cursor:"pointer"}} onClick={()=>onSelectStudent(s)}
                onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{i+1}</td>
                <td style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={s.name} idx={s.id} size={28}/><span>{s.name}</span></div></td>
                <td style={{padding:"8px 12px"}}><Badge label={s.cls+"반"} type={clsColor[s.cls]}/></td>
                <td style={{padding:"8px 12px",color:s.attend<75?"#E24B4A":"#2C2C2A"}}>{s.attend}%</td>
                <td style={{padding:"8px 12px",fontWeight:500,color:s.score>=85?"#27500A":s.score>=70?"#633806":"#791F1F"}}>{s.score}점</td>
                <td style={{padding:"8px 12px",fontWeight:500}}>{s.rank}위</td>
                <td style={{padding:"8px 12px"}}><Badge label={s.status==="ok"?"정상":"주의"} type={s.status==="ok"?"green":"red"}/></td>
                <td style={{padding:"8px 12px"}}><button onClick={e=>{e.stopPropagation();onSelectStudent(s);}} style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",cursor:"pointer",color:"#888780"}}>상세 보기</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// 학생 상세
// ════════════════════════════════════════════════
function StudentDetail({ student, onBack }) {
  const clsColor  = {A:"blue",B:"green",C:"amber"};
  const progColor = v => v>=85?"#639922":v>=70?"#BA7517":"#E24B4A";
  const latest      = SCORE_HISTORY[SCORE_HISTORY.length-1].s;
  const diff        = latest - SCORE_HISTORY[SCORE_HISTORY.length-2].s;
  const attArr      = MONTH_ATT[student.id]||[];
  const attendCount = attArr.filter(v=>v===1).length;
  const progress    = PROGRESS_LABELS.map((l,i)=>[l, [90,85,92,88,80,83][i]]);

  return (
    <div>
      <BtnSecondary onClick={onBack} style={{marginBottom:16}}>← 목록으로</BtnSecondary>
      <Card mb={12}>
        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          <Avatar name={student.name} idx={student.id} size={52}/>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:500,marginBottom:4}}>{student.name}</div>
            <div style={{fontSize:13,color:"#888780",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <Badge label={student.cls+"반"} type={clsColor[student.cls]}/>
              <span>{student.grade}</span><span>·</span><span>{student.course}</span><span>·</span><span>{student.phone}</span>
            </div>
          </div>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
        <KpiCard label="최근 단어시험" value={latest+"점"} sub={diff>0?`▲ ${diff}점`:`▼ ${Math.abs(diff)}점`} valueColor={diff>=0?"#27500A":"#E24B4A"}/>
        <KpiCard label="반 내 등수"    value={student.rank+"위"} sub="전체 20명"/>
        <KpiCard label="출석률"        value={Math.round(attendCount/attArr.length*100)+"%"} sub={`${attendCount} / ${attArr.length}회`}/>
        <KpiCard label="시험 합격"     value={student.pass+"회"} sub="이번 달"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card mb={0}>
          <SectionTitle>단어시험 점수 추이</SectionTitle>
          {[...SCORE_HISTORY].reverse().map((x,i)=>{
            const col=x.s>=85?"#639922":x.s>=70?"#BA7517":"#E24B4A";
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                <span style={{fontSize:11,color:"#888780",width:60,flexShrink:0}}>{x.wk}</span>
                <div style={{flex:1,background:"#F1EFE8",borderRadius:99,height:7,overflow:"hidden"}}>
                  <div style={{width:x.s+"%",height:"100%",background:col,borderRadius:99}}/>
                </div>
                <span style={{fontSize:12,fontWeight:500,color:col,width:30,textAlign:"right"}}>{x.s}</span>
                <Badge label={x.s>=70?"합격":"불합격"} type={x.s>=70?"green":"red"}/>
              </div>
            );
          })}
        </Card>
        <Card mb={0}>
          <SectionTitle>영역별 학습 진도</SectionTitle>
          {progress.map(([label,val])=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
              <span style={{fontSize:12,color:"#888780",width:90,flexShrink:0}}>{label}</span>
              <div style={{flex:1,background:"#F1EFE8",borderRadius:99,height:6,overflow:"hidden"}}>
                <div style={{width:val+"%",height:"100%",background:progColor(val),borderRadius:99}}/>
              </div>
              <span style={{fontSize:11,fontWeight:500,color:progColor(val),width:32,textAlign:"right"}}>{val}%</span>
            </div>
          ))}
          <SectionTitle style={{marginTop:16}}>출석 현황</SectionTitle>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
            {attArr.map((v,i)=>(
              <div key={i} style={{width:20,height:20,borderRadius:"50%",background:v?"#EAF3DE":"#FCEBEB",color:v?"#27500A":"#791F1F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:500}}>{v?"O":"X"}</div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// 출석 체크
// ════════════════════════════════════════════════
function Attendance() {
  const today    = new Date();
  const todayStr = `${today.getFullYear()}년 ${today.getMonth()+1}월 ${today.getDate()}일 (${"일월화수목금토"[today.getDay()]}요일)`;
  const [filterCls, setFilterCls]   = useState("all");
  const [search, setSearch]         = useState("");
  const [att, setAtt]               = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const clsColor = {A:"blue",B:"green",C:"amber"};

  const filtered = STUDENTS.filter(s=>(filterCls==="all"||s.cls===filterCls)&&(!search||s.name.includes(search)));
  const setOne = (id,val) => setAtt(prev=>{const n={...prev};if(n[id]===val)delete n[id];else n[id]=val;return n;});
  const bulkSet = (val) => {const n={...att};filtered.forEach(s=>{if(val===null)delete n[s.id];else n[s.id]=val;});setAtt(n);};

  const oCount=filtered.filter(s=>att[s.id]==="O").length;
  const xCount=filtered.filter(s=>att[s.id]==="X").length;
  const lCount=filtered.filter(s=>att[s.id]==="L").length;
  const nCount=filtered.filter(s=>!att[s.id]).length;

  const save=()=>{
    const missing=filtered.filter(s=>!att[s.id]);
    if(missing.length>0){const ok=window.confirm(`${missing.map(s=>s.name).join(", ")} — ${missing.length}명 미입력입니다. 저장할까요?`);if(!ok)return;}
    setSuccessMsg(`${todayStr} 저장 완료 — 출석 ${oCount}명 / 결석 ${xCount}명 / 지각 ${lCount}명`);
    setTimeout(()=>setSuccessMsg(""),4000);
  };

  const attBtn=(sid,type)=>{
    const active=att[sid]===type;
    const col={O:{bg:"#EAF3DE",c:"#27500A",b:"#97C459"},X:{bg:"#FCEBEB",c:"#791F1F",b:"#F09595"},L:{bg:"#FAEEDA",c:"#633806",b:"#EF9F27"},E:{bg:"#E6F1FB",c:"#0C447C",b:"#85B7EB"}}[type];
    return {width:34,height:28,borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:500,border:`0.5px solid ${active?col.b:"#D3D1C7"}`,background:active?col.bg:"transparent",color:active?col.c:"#888780"};
  };

  return (
    <div>
      <div style={{fontSize:13,color:"#888780",marginBottom:16}}>{todayStr}</div>
      <SuccessBox msg={successMsg}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
        <KpiCard label="출석"   value={oCount} sub={filtered.length?Math.round(oCount/filtered.length*100)+"%":"—"} valueColor="#27500A"/>
        <KpiCard label="결석"   value={xCount} sub={filtered.length?Math.round(xCount/filtered.length*100)+"%":"—"} valueColor="#E24B4A"/>
        <KpiCard label="지각"   value={lCount} sub={filtered.length?Math.round(lCount/filtered.length*100)+"%":"—"} valueColor="#BA7517"/>
        <KpiCard label="미입력" value={nCount} sub={nCount===0?"완료 ✓":"미입력"} valueColor={nCount===0?"#27500A":"#888780"}/>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <ClassFilter value={filterCls} onChange={setFilterCls}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="이름 검색..." style={{fontSize:13,padding:"5px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",background:"white",color:"#2C2C2A",flex:1,minWidth:120}}/>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
        <span style={{fontSize:12,color:"#888780"}}>일괄:</span>
        {[["전원 출석","O","#27500A","#EAF3DE","#97C459"],["전원 결석","X","#791F1F","#FCEBEB","#F09595"],["전원 지각","L","#633806","#FAEEDA","#EF9F27"]].map(([label,val,c,bg,border])=>(
          <button key={val} onClick={()=>bulkSet(val)} style={{fontSize:12,padding:"5px 12px",borderRadius:99,cursor:"pointer",border:`0.5px solid ${border}`,background:bg,color:c,fontWeight:500}}>{label}</button>
        ))}
        <button onClick={()=>bulkSet(null)} style={{fontSize:12,padding:"5px 12px",borderRadius:99,cursor:"pointer",border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780"}}>초기화</button>
      </div>
      <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden",marginBottom:16}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"#F1EFE8"}}>
            {["#","이름","반","출결 선택","현황","이번 달"].map((h,i)=><th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((s,i)=>(
              <tr key={s.id} style={{borderBottom:"0.5px solid #D3D1C7"}}
                onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{i+1}</td>
                <td style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={s.name} idx={s.id} size={26}/><span>{s.name}</span></div></td>
                <td style={{padding:"8px 12px"}}><Badge label={s.cls+"반"} type={clsColor[s.cls]}/></td>
                <td style={{padding:"8px 12px"}}>
                  <div style={{display:"flex",gap:4}}>
                    {[["O","출"],["X","결"],["L","지"],["E","공"]].map(([val,label])=>(
                      <button key={val} onClick={()=>setOne(s.id,val)} style={attBtn(s.id,val)}>{label}</button>
                    ))}
                  </div>
                </td>
                <td style={{padding:"8px 12px"}}>
                  {att[s.id]==="O"&&<Badge label="출석" type="green"/>}
                  {att[s.id]==="X"&&<Badge label="결석" type="red"/>}
                  {att[s.id]==="L"&&<Badge label="지각" type="amber"/>}
                  {att[s.id]==="E"&&<Badge label="공결" type="blue"/>}
                  {!att[s.id]&&<Badge label="미입력" type="gray"/>}
                </td>
                <td style={{padding:"8px 12px"}}>
                  <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
                    {(MONTH_ATT[s.id]||[]).map((v,j)=><div key={j} style={{width:10,height:10,borderRadius:"50%",background:v?"#97C459":"#F09595"}}/>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
        <BtnSecondary onClick={()=>bulkSet(null)}>초기화</BtnSecondary>
        <BtnPrimary onClick={save}>저장 완료</BtnPrimary>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// 단어시험 점수 입력
// ════════════════════════════════════════════════
function ScoreEntry() {
  const [filterCls, setFilterCls]   = useState("all");
  const [scores, setScores]         = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [maxScore, setMaxScore]     = useState(100);
  const clsColor = {A:"blue",B:"green",C:"amber"};

  const filtered = STUDENTS.filter(s=>filterCls==="all"||s.cls===filterCls);
  const passLine = Math.round(maxScore*0.7);

  const setScore=(id,val)=>{
    const n={...scores};
    if(val===""||isNaN(val))delete n[id];
    else n[id]=Math.min(Math.max(0,parseInt(val)),maxScore);
    setScores(n);
  };

  const filled  = filtered.filter(s=>scores[s.id]!==undefined).length;
  const avg     = filled>0?Math.round(filtered.filter(s=>scores[s.id]!==undefined).reduce((a,s)=>a+scores[s.id],0)/filled):null;
  const passCount = filtered.filter(s=>scores[s.id]!==undefined&&scores[s.id]>=passLine).length;

  const save=()=>{
    if(filled===0){alert("입력된 점수가 없습니다.");return;}
    setSuccessMsg(`저장 완료 — ${filled}명 입력, 평균 ${avg}점, 합격 ${passCount}명`);
    setTimeout(()=>setSuccessMsg(""),4000);
  };

  const scoreColor=v=>{const p=v/maxScore*100;return p>=80?"#27500A":p>=65?"#633806":"#791F1F";};
  const scoreBg   =v=>{const p=v/maxScore*100;return p>=80?"#EAF3DE":p>=65?"#FAEEDA":"#FCEBEB";};
  const inputCls  =v=>{if(v===undefined)return{};const p=v/maxScore*100;return p>=80?{background:"#EAF3DE",color:"#27500A",borderColor:"#97C459"}:p>=65?{background:"#FAEEDA",color:"#633806",borderColor:"#EF9F27"}:{background:"#FCEBEB",color:"#791F1F",borderColor:"#F09595"};};

  return (
    <div>
      <SuccessBox msg={successMsg}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
        <KpiCard label="입력 완료" value={`${filled} / ${filtered.length}`} sub="명"/>
        <KpiCard label="평균 점수" value={avg!==null?avg+"점":"—"} sub="입력된 학생 기준"/>
        <KpiCard label="합격"      value={passCount+"명"} sub={`합격선 ${passLine}점`} valueColor="#27500A"/>
        <KpiCard label="불합격"    value={filled>0?filled-passCount+"명":"—"} sub="" valueColor="#E24B4A"/>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <ClassFilter value={filterCls} onChange={setFilterCls}/>
        <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:"auto"}}>
          <span style={{fontSize:12,color:"#888780"}}>만점:</span>
          <input type="number" value={maxScore} onChange={e=>setMaxScore(parseInt(e.target.value)||100)} style={{width:64,fontSize:13,padding:"4px 8px",borderRadius:6,border:"0.5px solid #D3D1C7"}}/>
          <button onClick={()=>{const n={};filtered.forEach(s=>{if(scores[s.id]===undefined)n[s.id]=maxScore;});setScores({...scores,...n});}} style={{fontSize:12,padding:"5px 10px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>빈 칸 채우기</button>
          <button onClick={()=>setScores({})} style={{fontSize:12,padding:"5px 10px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>전체 초기화</button>
        </div>
      </div>
      <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden",marginBottom:16}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"#F1EFE8"}}>
            {["#","이름","반","점수 입력","합격 여부","이전 점수","변화"].map((h,i)=><th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((s,i)=>{
              const v=scores[s.id];
              const prev=s.score;
              const diff=v!==undefined?v-prev:null;
              return (
                <tr key={s.id} style={{borderBottom:"0.5px solid #D3D1C7"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{i+1}</td>
                  <td style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={s.name} idx={s.id} size={26}/><span>{s.name}</span></div></td>
                  <td style={{padding:"8px 12px"}}><Badge label={s.cls+"반"} type={clsColor[s.cls]}/></td>
                  <td style={{padding:"8px 12px"}}>
                    <input type="number" min="0" max={maxScore} value={v??""} placeholder="—" onChange={e=>setScore(s.id,e.target.value)}
                      style={{width:64,textAlign:"center",fontSize:13,padding:"4px 6px",borderRadius:6,border:"0.5px solid #D3D1C7",...inputCls(v)}}/>
                  </td>
                  <td style={{padding:"8px 12px"}}>
                    {v!==undefined?<Badge label={v>=passLine?"합격":"불합격"} type={v>=passLine?"green":"red"}/>:<Badge label="—" type="gray"/>}
                  </td>
                  <td style={{padding:"8px 12px",color:"#888780"}}>{prev}점</td>
                  <td style={{padding:"8px 12px"}}>
                    {diff!==null?(diff>0?<span style={{color:"#27500A",fontSize:12}}>▲{diff}</span>:diff<0?<span style={{color:"#E24B4A",fontSize:12}}>▼{Math.abs(diff)}</span>:<span style={{color:"#888780",fontSize:12}}>—</span>):<span style={{color:"#888780",fontSize:12}}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
        <BtnSecondary onClick={()=>setScores({})}>초기화</BtnSecondary>
        <BtnPrimary onClick={save}>저장 완료</BtnPrimary>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// 과제물 자료실
// ════════════════════════════════════════════════
function Homework() {
  const [filterCls, setFilterCls]   = useState("all");
  const [filterSubj, setFilterSubj] = useState("all");
  const [search, setSearch]         = useState("");
  const [dlCounts, setDlCounts]     = useState(()=>Object.fromEntries(HOMEWORK_FILES.map(f=>[f.id,f.dl])));
  const [successMsg, setSuccessMsg] = useState("");

  const subjColor = {문법:"blue",독해:"green",어휘:"amber",듣기:"purple",수능:"red"};
  const clsColor  = {전체:"gray",A:"blue",B:"green",C:"amber"};

  const filtered = HOMEWORK_FILES.filter(f=>
    (filterCls==="all"||f.cls==="전체"||f.cls===filterCls)&&
    (filterSubj==="all"||f.subj===filterSubj)&&
    (!search||f.title.includes(search)||f.desc.includes(search))
  );

  const download=(f)=>{
    setDlCounts(prev=>({...prev,[f.id]:(prev[f.id]||0)+1}));
    setSuccessMsg(`"${f.title}" 다운로드가 시작되었습니다.`);
    setTimeout(()=>setSuccessMsg(""),3000);
  };

  return (
    <div>
      <SuccessBox msg={successMsg}/>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <ClassFilter value={filterCls} onChange={setFilterCls}/>
        <select value={filterSubj} onChange={e=>setFilterSubj(e.target.value)} style={{fontSize:12,padding:"5px 10px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"white",color:"#2C2C2A"}}>
          <option value="all">전체 과목</option>
          {["문법","독해","어휘","듣기","수능"].map(v=><option key={v} value={v}>{v}</option>)}
        </select>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="자료 검색..." style={{fontSize:13,padding:"5px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",background:"white",color:"#2C2C2A",flex:1,minWidth:120}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
        {filtered.map(f=>(
          <div key={f.id} style={{background:"white",border:`0.5px solid ${f.isNew?"#185FA5":"#D3D1C7"}`,borderRadius:12,padding:"1rem",display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",gap:10}}>
              <div style={{width:40,height:48,borderRadius:6,background:"#FCEBEB",color:"#791F1F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:500,flexShrink:0}}>PDF</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A",lineHeight:1.4}}>{f.title}</div>
                <div style={{fontSize:11,color:"#888780",marginTop:3}}>{f.desc}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              <Badge label={f.subj} type={subjColor[f.subj]||"gray"}/>
              <Badge label={f.cls==="전체"?"전체 반":f.cls+"반"} type={clsColor[f.cls]||"gray"}/>
              {f.isNew&&<Badge label="NEW" type="blue"/>}
              {f.due&&<Badge label={`마감 ${f.due}`} type="gray"/>}
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:8,borderTop:"0.5px solid #D3D1C7"}}>
              <span style={{fontSize:11,color:"#888780"}}>{f.size} · {dlCounts[f.id]}회 다운로드</span>
              <button onClick={()=>download(f)} style={{fontSize:12,fontWeight:500,color:"#185FA5",background:"#E6F1FB",border:"none",padding:"5px 10px",borderRadius:6,cursor:"pointer"}}>↓ 다운로드</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// 자동 채점
// ════════════════════════════════════════════════
function Grading() {
  const [tab, setTab]             = useState("setup");
  const [qCount, setQCount]       = useState(15);
  const [answerKey, setAnswerKey] = useState(Array(15).fill(0));
  const [studentAns, setStudentAns] = useState({});
  const [studentScores, setStudentScores] = useState({});
  const [selStudent, setSelStudent] = useState(0);
  const [filterCls, setFilterCls] = useState("all");
  const [successMsg, setSuccessMsg] = useState("");

  const handleQCount = (n) => {
    setQCount(n);
    setAnswerKey(prev=>{const a=[...prev];while(a.length<n)a.push(0);return a.slice(0,n);});
  };

  const setAns = (idx,val) => setAnswerKey(prev=>{const a=[...prev];a[idx]=a[idx]===val?0:val;return a;});

  const randomize = () => {
    const key = Array.from({length:qCount},()=>Math.ceil(Math.random()*5));
    setAnswerKey(key);
    const ans={};
    const sc={};
    STUDENTS.forEach(s=>{
      const a=key.map(k=>Math.random()<0.65?k:((k%5)+1));
      ans[s.id]=a;
      const correct=a.filter((v,i)=>v===key[i]).length;
      sc[s.id]={correct,total:qCount,score:Math.round(correct/qCount*100),wrong:a.map((v,i)=>v!==key[i]?i+1:null).filter(Boolean)};
    });
    setStudentAns(ans);
    setStudentScores(sc);
    setSuccessMsg("랜덤 설정 완료!");
    setTimeout(()=>setSuccessMsg(""),2000);
  };

  const markOMR=(qIdx,val)=>{
    setStudentAns(prev=>{
      const a=[...(prev[selStudent]||Array(qCount).fill(0))];
      a[qIdx]=a[qIdx]===val?0:val;
      return {...prev,[selStudent]:a};
    });
    setStudentScores(prev=>{const n={...prev};delete n[selStudent];return n;});
  };

  const grade=()=>{
    if(answerKey.some(a=>a===0)){alert("정답지를 먼저 설정해주세요.");return;}
    const ans=studentAns[selStudent]||[];
    if(ans.every(a=>a===0)){alert("답안을 입력해주세요.");return;}
    const correct=ans.filter((v,i)=>v===answerKey[i]).length;
    const sc={correct,total:qCount,score:Math.round(correct/qCount*100),wrong:ans.map((v,i)=>v!==answerKey[i]?i+1:null).filter(Boolean)};
    setStudentScores(prev=>({...prev,[selStudent]:sc}));
    const s=STUDENTS.find(x=>x.id===selStudent);
    const grade=sc.score>=90?"A":sc.score>=80?"B":sc.score>=70?"C":sc.score>=60?"D":"F";
    setSuccessMsg(`${s.name} 채점 완료 — ${sc.score}점 (${grade}등급)`);
    setTimeout(()=>setSuccessMsg(""),3000);
  };

  const filteredStudents = STUDENTS.filter(s=>filterCls==="all"||s.cls===filterCls);
  const graded = filteredStudents.filter(s=>studentScores[s.id]);
  const scores = graded.map(s=>studentScores[s.id].score);
  const avg    = scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0;

  const curAns   = studentAns[selStudent]||Array(qCount).fill(0);
  const curScore = studentScores[selStudent];
  const pct      = curScore?.score||0;
  const gradeLabel = pct>=90?"A":pct>=80?"B":pct>=70?"C":pct>=60?"D":"F";
  const gradeColor = pct>=90?"#27500A":pct>=80?"#0C447C":pct>=70?"#633806":"#791F1F";
  const gradeBg    = pct>=90?"#EAF3DE":pct>=80?"#E6F1FB":pct>=70?"#FAEEDA":"#FCEBEB";
  const barCol     = pct>=80?"#639922":pct>=65?"#BA7517":"#E24B4A";

  const chunkSize=15;
  const chunks=[];
  for(let i=0;i<qCount;i+=chunkSize)chunks.push([i,Math.min(i+chunkSize,qCount)]);

  return (
    <div>
      <SuccessBox msg={successMsg}/>
      <div style={{display:"flex",gap:4,marginBottom:16}}>
        {[["setup","정답지 설정"],["student","학생 답안 입력"],["results","전체 결과"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{fontSize:12,padding:"5px 14px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:tab===id?"#888780":"#D3D1C7",background:tab===id?"#F1EFE8":"transparent",color:tab===id?"#2C2C2A":"#888780",fontWeight:tab===id?500:400}}>{label}</button>
        ))}
      </div>

      {tab==="setup"&&(
        <Card>
          <SectionTitle>시험 설정</SectionTitle>
          <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
            <div>
              <div style={{fontSize:12,color:"#888780",marginBottom:4}}>문항 수</div>
              <select value={qCount} onChange={e=>handleQCount(parseInt(e.target.value))} style={{fontSize:13,padding:"5px 8px",borderRadius:6,border:"0.5px solid #D3D1C7"}}>
                {[10,15,20,25,30,35,40,45].map(n=><option key={n} value={n}>{n}문항</option>)}
              </select>
            </div>
            <button onClick={randomize} style={{fontSize:12,padding:"7px 14px",borderRadius:8,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer",marginTop:18}}>랜덤 설정 (테스트용)</button>
            <BtnPrimary onClick={()=>{if(answerKey.some(a=>a===0)){alert("모든 정답을 입력해주세요.");return;}setSuccessMsg(`정답지 저장 완료 — ${qCount}문항`);setTimeout(()=>setSuccessMsg(""),2000);}} style={{marginTop:18}}>정답지 저장</BtnPrimary>
          </div>
          <SectionTitle>정답 입력 (클릭하여 선택)</SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(chunks.length,3)},1fr)`,gap:12}}>
            {chunks.map(([start,end])=>(
              <div key={start}>
                <div style={{fontSize:11,fontWeight:500,color:"#888780",marginBottom:6,paddingBottom:4,borderBottom:"0.5px solid #D3D1C7"}}>{start+1}번 — {end}번</div>
                {Array.from({length:end-start},(_,j)=>{
                  const i=start+j;
                  return (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:"0.5px solid #F1EFE8"}}>
                      <div style={{width:24,height:24,borderRadius:"50%",background:answerKey[i]>0?"#EAF3DE":"#F1EFE8",color:answerKey[i]>0?"#27500A":"#888780",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:500,flexShrink:0}}>{i+1}</div>
                      <div style={{display:"flex",gap:3}}>
                        {[1,2,3,4,5].map(v=>(
                          <button key={v} onClick={()=>setAns(i,v)} style={{width:28,height:24,borderRadius:4,cursor:"pointer",fontSize:11,fontWeight:500,border:`0.5px solid ${answerKey[i]===v?"#97C459":"#D3D1C7"}`,background:answerKey[i]===v?"#EAF3DE":"transparent",color:answerKey[i]===v?"#27500A":"#888780"}}>{v}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab==="student"&&(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
            <ClassFilter value={filterCls} onChange={setFilterCls}/>
            <select value={selStudent} onChange={e=>setSelStudent(parseInt(e.target.value))} style={{fontSize:13,padding:"5px 8px",borderRadius:6,border:"0.5px solid #D3D1C7"}}>
              {filteredStudents.map(s=><option key={s.id} value={s.id}>{s.name} ({s.cls}반)</option>)}
            </select>
            <div style={{display:"flex",gap:4,marginLeft:"auto"}}>
              <button onClick={()=>{const idx=filteredStudents.findIndex(s=>s.id===selStudent);if(idx>0)setSelStudent(filteredStudents[idx-1].id);}} style={{fontSize:12,padding:"5px 10px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",cursor:"pointer",color:"#888780"}}>◀ 이전</button>
              <button onClick={()=>{const idx=filteredStudents.findIndex(s=>s.id===selStudent);if(idx<filteredStudents.length-1)setSelStudent(filteredStudents[idx+1].id);}} style={{fontSize:12,padding:"5px 10px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",cursor:"pointer",color:"#888780"}}>다음 ▶</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Card mb={0}>
              <SectionTitle>OMR 답안 입력</SectionTitle>
              <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(chunks.length,3)},1fr)`,gap:10,marginBottom:12}}>
                {chunks.map(([start,end])=>(
                  <div key={start}>
                    <div style={{fontSize:10,fontWeight:500,color:"#888780",marginBottom:4}}>{start+1}~{end}번</div>
                    {Array.from({length:end-start},(_,j)=>{
                      const i=start+j;
                      return (
                        <div key={i} style={{display:"flex",alignItems:"center",gap:3,marginBottom:3}}>
                          <span style={{fontSize:10,color:"#888780",width:20,textAlign:"right",flexShrink:0}}>{i+1}</span>
                          <div style={{display:"flex",gap:2}}>
                            {[1,2,3,4,5].map(v=>{
                              const isSelected=curAns[i]===v;
                              const showResult=!!curScore;
                              let bg="transparent",color="#888780",border="0.5px solid #D3D1C7";
                              if(showResult){
                                if(isSelected&&answerKey[i]===v){bg="#EAF3DE";color="#27500A";border="0.5px solid #97C459";}
                                else if(isSelected&&answerKey[i]!==v){bg="#FCEBEB";color="#791F1F";border="0.5px solid #F09595";}
                                else if(!isSelected&&answerKey[i]===v&&curAns[i]!==0){bg="#EAF3DE";color="#27500A";border="0.5px solid #97C459";}
                              } else if(isSelected){bg="#185FA5";color="#E6F1FB";border="0.5px solid #185FA5";}
                              return <div key={v} onClick={()=>markOMR(i,v)} style={{width:20,height:16,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,cursor:"pointer",background:bg,color,border}}>{v}</div>;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
                <BtnSecondary onClick={()=>{setStudentAns(prev=>({...prev,[selStudent]:Array(qCount).fill(0)}));setStudentScores(prev=>{const n={...prev};delete n[selStudent];return n;});}}>초기화</BtnSecondary>
                <BtnPrimary onClick={grade}>자동 채점</BtnPrimary>
              </div>
            </Card>
            <div>
              {curScore?(
                <Card mb={0}>
                  <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:6}}>
                    <span style={{fontSize:40,fontWeight:500,color:"#2C2C2A",lineHeight:1}}>{pct}</span>
                    <span style={{fontSize:16,color:"#888780"}}>점</span>
                    <span style={{fontSize:14,padding:"3px 12px",borderRadius:99,fontWeight:500,background:gradeBg,color:gradeColor}}>{gradeLabel}</span>
                  </div>
                  <div style={{fontSize:12,color:"#888780",marginBottom:8}}>{curScore.correct} / {curScore.total}문항 정답</div>
                  <div style={{height:8,background:"#F1EFE8",borderRadius:99,overflow:"hidden",marginBottom:4}}>
                    <div style={{width:pct+"%",height:"100%",background:barCol,borderRadius:99}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:16}}>
                    <span style={{color:"#27500A"}}>정답 {curScore.correct}개</span>
                    <span style={{color:"#E24B4A"}}>오답 {curScore.wrong.length}개</span>
                  </div>
                  {curScore.wrong.length>0?(
                    <>
                      <SectionTitle>틀린 문항 ({curScore.wrong.length}개)</SectionTitle>
                      {curScore.wrong.map(qn=>(
                        <div key={qn} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:"0.5px solid #F1EFE8",fontSize:12}}>
                          <div style={{width:22,height:22,borderRadius:"50%",background:"#FCEBEB",color:"#791F1F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:500}}>{qn}</div>
                          <span style={{color:"#888780"}}>정답</span><Badge label={answerKey[qn-1]+"번"} type="green"/>
                          <span style={{color:"#888780"}}>학생</span><Badge label={curAns[qn-1]+"번"} type="red"/>
                        </div>
                      ))}
                    </>
                  ):<div style={{textAlign:"center",padding:"1rem",color:"#27500A",fontWeight:500}}>만점! 🎉</div>}
                </Card>
              ):<div style={{fontSize:13,color:"#888780",textAlign:"center",padding:"3rem 0"}}>채점 버튼을 누르면<br/>결과가 여기 표시돼요</div>}
            </div>
          </div>
        </div>
      )}

      {tab==="results"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
            <KpiCard label="채점 완료" value={graded.length+"명"} sub={`전체 ${filteredStudents.length}명`}/>
            <KpiCard label="평균 점수" value={avg+"점"} sub={`최고 ${scores.length?Math.max(...scores):0}점`}/>
            <KpiCard label="합격(70점↑)" value={scores.filter(s=>s>=70).length+"명"} sub={scores.length?Math.round(scores.filter(s=>s>=70).length/scores.length*100)+"%":"—"} valueColor="#27500A"/>
            <KpiCard label="미채점" value={(filteredStudents.length-graded.length)+"명"} sub="답안 미입력"/>
          </div>
          <div style={{marginBottom:12}}><ClassFilter value={filterCls} onChange={setFilterCls}/></div>
          <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"#F1EFE8"}}>
                {["등수","학생","반","점수","등급","정답","틀린 문항"].map((h,i)=><th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[...graded].sort((a,b)=>studentScores[b.id].score-studentScores[a.id].score).map((s,i)=>{
                  const r=studentScores[s.id];
                  const p=r.score;
                  const g=p>=90?"A":p>=80?"B":p>=70?"C":"D↓";
                  const gType=p>=90?"green":p>=80?"blue":p>=70?"amber":"red";
                  const bc=p>=80?"#639922":p>=65?"#BA7517":"#E24B4A";
                  return (
                    <tr key={s.id} style={{borderBottom:"0.5px solid #D3D1C7"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{padding:"8px 12px",fontWeight:500,color:i<3?"#BA7517":"#888780"}}>{i+1}</td>
                      <td style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={s.name} idx={s.id} size={26}/><span>{s.name}</span></div></td>
                      <td style={{padding:"8px 12px"}}><Badge label={s.cls+"반"} type={{A:"blue",B:"green",C:"amber"}[s.cls]}/></td>
                      <td style={{padding:"8px 12px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <div style={{width:60,height:5,background:"#F1EFE8",borderRadius:99,overflow:"hidden"}}><div style={{width:p+"%",height:"100%",background:bc,borderRadius:99}}/></div>
                          <span style={{fontWeight:500,color:bc}}>{p}</span>
                        </div>
                      </td>
                      <td style={{padding:"8px 12px"}}><Badge label={g} type={gType}/></td>
                      <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{r.correct}/{r.total}</td>
                      <td style={{padding:"8px 12px"}}>{r.wrong.slice(0,4).map(n=><Badge key={n} label={n+"번"} type="red"/>) }{r.wrong.length>4&&<span style={{fontSize:11,color:"#888780"}}> +{r.wrong.length-4}</span>}</td>
                    </tr>
                  );
                })}
                {filteredStudents.filter(s=>!studentScores[s.id]).map(s=>(
                  <tr key={s.id} style={{borderBottom:"0.5px solid #D3D1C7",opacity:0.4}}>
                    <td style={{padding:"8px 12px",color:"#888780"}}>—</td>
                    <td style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={s.name} idx={s.id} size={26}/><span>{s.name}</span></div></td>
                    <td style={{padding:"8px 12px"}}><Badge label={s.cls+"반"} type={{A:"blue",B:"green",C:"amber"}[s.cls]}/></td>
                    <td colSpan={4} style={{padding:"8px 12px",color:"#888780",fontSize:12}}>미채점</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// 학부모 리포트
// ════════════════════════════════════════════════
function Report() {
  const [selIdx, setSelIdx]   = useState(0);
  const [period, setPeriod]   = useState("mar");
  const clsColor = {A:"blue",B:"green",C:"amber"};
  const s = STUDENTS[selIdx];
  const attArr = MONTH_ATT[s.id]||[];
  const attendCount = attArr.filter(v=>v===1).length;
  const attendPct   = Math.round(attendCount/attArr.length*100);
  const latest      = SCORE_HISTORY[SCORE_HISTORY.length-1].s;
  const diff        = latest - SCORE_HISTORY[SCORE_HISTORY.length-2].s;
  const passCount   = SCORE_HISTORY.filter(x=>x.s>=70).length;
  const progColor   = v => v>=85?"#639922":v>=70?"#BA7517":"#E24B4A";
  const progress    = PROGRESS_LABELS.map((l,i)=>[l,[90,85,92,88,80,83][i]]);
  const memos = ["수업 참여도 우수. 어휘 실력이 특히 뛰어남. 다음 달 문제 풀이 속도 집중 훈련 예정.","꼼꼼하게 필기하는 스타일. 결석 보충 완료. 해석 부분 추가 연습 필요.","단어 암기 어려워함. 매일 10개씩 복습 권장. 결석 3회 — 학부모 연락 완료.","독해 최상위권. 개근 달성. 수능 대비 어법 루틴 추가 중.","기초 단계. 가정에서 파닉스 카드 병행 권장.","B반 전체 1위. 개근. 영어 경시대회 출전 추천.","결석 4회. 학부모 면담 필요. 기초 어휘부터 재정비 중.","안정적인 성취. 스피킹 훈련 추가 예정.","회화 발음 우수. 문법 보강 중.","수능 1등급 목표. 독해 최상위. 개근.","전 영역 최상위권. 이번 달 최고 점수 기록.","고급 독해 과정 우수 진행 중."];

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <select value={selIdx} onChange={e=>setSelIdx(parseInt(e.target.value))} style={{fontSize:13,padding:"5px 8px",borderRadius:6,border:"0.5px solid #D3D1C7"}}>
          {STUDENTS.map((s,i)=><option key={i} value={i}>{s.name} ({s.cls}반)</option>)}
        </select>
        <select value={period} onChange={e=>setPeriod(e.target.value)} style={{fontSize:13,padding:"5px 8px",borderRadius:6,border:"0.5px solid #D3D1C7"}}>
          <option value="mar">2026년 3월</option>
          <option value="feb">2026년 2월</option>
          <option value="jan">2026년 1월</option>
        </select>
      </div>

      <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden"}}>
        {/* 헤더 */}
        <div style={{background:"#185FA5",padding:"1.25rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(255,255,255,0.2)",color:"#E6F1FB",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:500}}>{s.name.slice(0,2)}</div>
            <div>
              <div style={{fontSize:18,fontWeight:500,color:"#E6F1FB"}}>{s.name} 학생 학습 리포트</div>
              <div style={{fontSize:12,color:"#85B7EB",marginTop:2,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{background:"rgba(255,255,255,0.2)",padding:"1px 8px",borderRadius:99,fontSize:11}}>{s.cls}반</span>
                <span>{s.grade}</span><span>·</span><span>{s.course}</span>
              </div>
            </div>
          </div>
          <div style={{fontSize:12,color:"#85B7EB",textAlign:"right"}}>2026년 3월<br/>월간 리포트</div>
        </div>

        <div style={{padding:"1.25rem 1.5rem"}}>
          {/* 요약 KPI */}
          <SectionTitle>이달의 요약</SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>
            <KpiCard label="단어시험 최근 점수" value={latest+"점"} sub={diff>0?`▲${diff}점`:diff<0?`▼${Math.abs(diff)}점`:"변화없음"} valueColor={diff>0?"#27500A":diff<0?"#E24B4A":"#888780"}/>
            <KpiCard label="출석률"             value={attendPct+"%"}    sub={`${attendCount}/${attArr.length}회`}/>
            <KpiCard label="단어시험 합격"       value={passCount+"회"}   sub={`총 ${SCORE_HISTORY.length}회 중`}/>
            <KpiCard label="반 내 등수"          value={s.rank+"위"}      sub={`전체 ${20}명`}/>
          </div>

          {/* 점수 추이 */}
          <SectionTitle>단어시험 점수 추이</SectionTitle>
          <div style={{marginBottom:20}}>
            {SCORE_HISTORY.map((x,i)=>{
              const col=x.s>=85?"#639922":x.s>=70?"#BA7517":"#E24B4A";
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{fontSize:11,color:"#888780",width:60,flexShrink:0}}>{x.wk}</span>
                  <div style={{flex:1,background:"#F1EFE8",borderRadius:99,height:8,overflow:"hidden"}}>
                    <div style={{width:x.s+"%",height:"100%",background:col,borderRadius:99}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:500,color:col,width:36,textAlign:"right"}}>{x.s}점</span>
                  <Badge label={x.s>=70?"합격":"불합격"} type={x.s>=70?"green":"red"}/>
                </div>
              );
            })}
          </div>

          {/* 영역별 진도 */}
          <SectionTitle>영역별 학습 진도</SectionTitle>
          <div style={{marginBottom:20}}>
            {progress.map(([label,val])=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
                <span style={{fontSize:12,color:"#888780",width:100,flexShrink:0}}>{label}</span>
                <div style={{flex:1,background:"#F1EFE8",borderRadius:99,height:6,overflow:"hidden"}}>
                  <div style={{width:val+"%",height:"100%",background:progColor(val),borderRadius:99}}/>
                </div>
                <span style={{fontSize:11,fontWeight:500,color:progColor(val),width:36,textAlign:"right"}}>{val}%</span>
              </div>
            ))}
          </div>

          {/* 출석 현황 */}
          <SectionTitle>출석 현황</SectionTitle>
          <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:20}}>
            {attArr.map((v,i)=>(
              <div key={i} style={{width:22,height:22,borderRadius:"50%",background:v?"#EAF3DE":"#FCEBEB",color:v?"#27500A":"#791F1F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:500}}>{v?"O":"X"}</div>
            ))}
          </div>

          {/* 강사 코멘트 */}
          <SectionTitle>담임 강사 코멘트</SectionTitle>
          <div style={{background:"#F1EFE8",borderRadius:8,padding:"12px 14px",fontSize:13,color:"#2C2C2A",lineHeight:1.7,marginBottom:8}}>
            {memos[selIdx]||"이번 달도 꾸준히 노력하고 있습니다. 앞으로도 지금처럼 열심히 해주길 바랍니다."}
          </div>
          <div style={{fontSize:12,color:"#888780",textAlign:"right"}}>English Academy 담당 강사 드림</div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// 메인 앱
// ════════════════════════════════════════════════
const NAV_ITEMS = [
  {id:"dashboard",  label:"대시보드"},
  {id:"attendance", label:"출석 체크"},
  {id:"scores",     label:"점수 입력"},
  {id:"homework",   label:"과제물"},
  {id:"grading",    label:"채점"},
  {id:"report",     label:"리포트"},
];

export default function App() {
  const [activeNav, setActiveNav]             = useState("dashboard");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleSelectStudent = (student) => { setSelectedStudent(student); setActiveNav("detail"); };

  const renderContent = () => {
    if (activeNav==="detail"&&selectedStudent)
      return <StudentDetail student={selectedStudent} onBack={()=>{setSelectedStudent(null);setActiveNav("dashboard");}}/>;
    switch(activeNav){
      case "dashboard":  return <Dashboard onSelectStudent={handleSelectStudent}/>;
      case "attendance": return <Attendance/>;
      case "scores":     return <ScoreEntry/>;
      case "homework":   return <Homework/>;
      case "grading":    return <Grading/>;
      case "report":     return <Report/>;
      default:           return null;
    }
  };

  return (
    <div style={{minHeight:"100vh",background:"#F1EFE8",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      <header style={{background:"#185FA5",padding:"0 20px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{color:"#E6F1FB",fontWeight:500,fontSize:16}}>English Academy</span>
        <span style={{color:"#85B7EB",fontSize:12}}>강사 모드</span>
      </header>
      <nav style={{background:"white",borderBottom:"0.5px solid #D3D1C7",padding:"0 20px",display:"flex",overflowX:"auto"}}>
        {NAV_ITEMS.map(item=>(
          <button key={item.id} onClick={()=>{setActiveNav(item.id);setSelectedStudent(null);}} style={{padding:"12px 16px",fontSize:13,cursor:"pointer",background:"transparent",border:"none",borderBottom:activeNav===item.id?"2px solid #185FA5":"2px solid transparent",color:activeNav===item.id?"#185FA5":"#888780",fontWeight:activeNav===item.id?500:400,whiteSpace:"nowrap"}}>
            {item.label}
          </button>
        ))}
      </nav>
      <main style={{maxWidth:960,margin:"0 auto",padding:"20px 16px"}}>
        {renderContent()}
      </main>
    </div>
  );
}