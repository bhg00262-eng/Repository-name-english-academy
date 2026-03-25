import { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://fqwhdhtajzeylhclmton.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxd2hkaHRhanpleWxoY2xtdG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODMxNjgsImV4cCI6MjA4OTY1OTE2OH0.i0wR8pucGqtqfx_qNecYHpQvIa0dDrEXiJ6uOSPQclQ"
);

const CLS_NAME={A:"이음 고1",B:"이음 고2",C:"고촌 고1",D:"수능단과 검단",E:"수능단과 중계",F:"중등 A"};
function clsLabel(cls){return CLS_NAME[cls]||cls;}

// ════════════════════════════════════════════════
// 비밀번호 설정
// ════════════════════════════════════════════════
const TEACHER_PASSWORD = "1234";

// ════════════════════════════════════════════════
// 데이터 (STUDENTS는 Supabase에서 동적으로 로드)
// ════════════════════════════════════════════════
let STUDENTS = []; // 앱 로드 시 채워짐

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

const MEMOS = [
  "수업 참여도 우수. 어휘 실력이 특히 뛰어남. 다음 달 문제 풀이 속도 집중 훈련 예정.",
  "꼼꼼하게 필기하는 스타일. 결석 보충 완료. 해석 부분 추가 연습 필요.",
  "단어 암기 어려워함. 매일 10개씩 복습 권장. 결석 3회 — 학부모 연락 완료.",
  "독해 최상위권. 개근 달성. 수능 대비 어법 루틴 추가 중.",
  "기초 단계. 가정에서 파닉스 카드 병행 권장.",
  "B반 전체 1위. 개근. 영어 경시대회 출전 추천.",
  "결석 4회. 학부모 면담 필요. 기초 어휘부터 재정비 중.",
  "안정적인 성취. 스피킹 훈련 추가 예정.",
  "회화 발음 우수. 문법 보강 중.",
  "수능 1등급 목표. 독해 최상위. 개근.",
  "전 영역 최상위권. 이번 달 최고 점수 기록.",
  "고급 독해 과정 우수 진행 중.",
];

// 초기 과제물 샘플 데이터
const INITIAL_FILES = [
  {id:1,title:"3월 3주차 문법 과제",subj:"문법",cls:"A",date:"2026.03.17",due:"3월 24일",isNew:true, desc:"관계대명사 & 분사구문 연습 15문항",url:"https://drive.google.com/file/d/sample1/view"},
  {id:2,title:"3월 3주차 독해 지문",subj:"독해",cls:"전체",date:"2026.03.17",due:"3월 24일",isNew:true, desc:"이번 주 수업 지문 + 해석 포함",url:"https://drive.google.com/file/d/sample2/view"},
  {id:3,title:"수능 기출 어휘 Vol.3",subj:"어휘",cls:"C",date:"2026.03.14",due:"3월 21일",isNew:false,desc:"2020~2025 수능 빈출 어휘 600개",url:"https://drive.google.com/file/d/sample3/view"},
];

// ════════════════════════════════════════════════
// 공통 컴포넌트
// ════════════════════════════════════════════════
function Avatar({name,idx,size=32}){
  const c=AVATAR_COLORS[idx%AVATAR_COLORS.length];
  return <div style={{width:size,height:size,borderRadius:"50%",background:c.bg,color:c.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:500,flexShrink:0}}>{name.slice(0,2)}</div>;
}

function Badge({label,type="gray"}){
  const map={blue:{bg:"#E6F1FB",c:"#0C447C"},green:{bg:"#EAF3DE",c:"#27500A"},amber:{bg:"#FAEEDA",c:"#633806"},red:{bg:"#FCEBEB",c:"#791F1F"},gray:{bg:"#F1EFE8",c:"#5F5E5A"},purple:{bg:"#EEEDFE",c:"#3C3489"}};
  const s=map[type]||map.gray;
  return <span style={{display:"inline-block",fontSize:10,padding:"2px 8px",borderRadius:99,fontWeight:500,background:s.bg,color:s.c}}>{label}</span>;
}

function KpiCard({label,value,sub,valueColor}){
  return(
    <div style={{background:"#F1EFE8",borderRadius:8,padding:"10px 12px"}}>
      <div style={{fontSize:11,color:"#888780",marginBottom:4}}>{label}</div>
      <div style={{fontSize:22,fontWeight:500,color:valueColor||"#2C2C2A"}}>{value}</div>
      <div style={{fontSize:11,color:"#888780",marginTop:2}}>{sub}</div>
    </div>
  );
}

function SuccessBox({msg}){
  if(!msg)return null;
  return <div style={{background:"#EAF3DE",border:"0.5px solid #97C459",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#27500A",display:"flex",alignItems:"center",gap:8,marginBottom:16}}>✓ {msg}</div>;
}

function Card({children,mb=12}){
  return <div style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:12,padding:"1rem 1.25rem",marginBottom:mb}}>{children}</div>;
}

function SectionTitle({children}){
  return <div style={{fontSize:12,fontWeight:500,color:"#888780",marginBottom:10,letterSpacing:"0.03em"}}>{children}</div>;
}

function BtnPrimary({onClick,children,style={}}){
  return <button onClick={onClick} style={{fontSize:13,padding:"8px 18px",borderRadius:8,cursor:"pointer",border:"none",background:"#185FA5",color:"#E6F1FB",fontWeight:500,...style}}>{children}</button>;
}

function BtnSecondary({onClick,children,style={}}){
  return <button onClick={onClick} style={{fontSize:13,padding:"8px 14px",borderRadius:8,cursor:"pointer",border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",...style}}>{children}</button>;
}

function ClassFilter({value,onChange}){
  return(
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {["all","A","B","C","D","E","F"].map(v=>(
        <button key={v} onClick={()=>onChange(v)} style={{fontSize:12,padding:"5px 14px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:value===v?"#888780":"#D3D1C7",background:value===v?"#F1EFE8":"transparent",color:value===v?"#2C2C2A":"#888780",fontWeight:value===v?500:400}}>
          {v==="all"?"전체":{A:"이음 고1",B:"이음 고2",C:"고촌 고1",D:"수능단과 검단",E:"수능단과 중계",F:"중등 A"}[v]}
        </button>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════
// 로그인 화면
// ════════════════════════════════════════════════
function ReviewBanner({reviews}){
  if(!reviews||reviews.length===0) return null;
  const items=[...reviews,...reviews,...reviews];
  return(
    <div style={{overflow:"hidden",width:"100%",position:"relative"}}>
      <style>{`
        @keyframes scrollLeft{0%{transform:translateX(0)}100%{transform:translateX(-33.33%)}}
        .review-track{display:flex;gap:12px;animation:scrollLeft 40s linear infinite;width:max-content;}
        .review-track:hover{animation-play-state:paused;}
      `}</style>
      <div className="review-track">
        {items.map((r,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.08)",backdropFilter:"blur(8px)",borderRadius:12,padding:"14px 16px",minWidth:220,maxWidth:240,border:"1px solid rgba(255,255,255,0.12)",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"white",fontWeight:600,flexShrink:0}}>{(r.student_name||"").slice(0,1)}</div>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:"white"}}>{(r.student_name||"").length>1?(r.student_name[0]+"O"+(r.student_name.slice(2)||"")):r.student_name}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>{r.cls}반</div>
              </div>
              <div style={{marginLeft:"auto",fontSize:11,color:"#FFD700"}}>{"★".repeat(Math.min(5,r.rating||5))}</div>
            </div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",lineHeight:1.6,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>{r.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function LoginScreen({onTeacherLogin,onStudentLogin}){
  const [mode,setMode]=useState(null);
  const [password,setPassword]=useState("");
  const [selStudentId,setSelStudentId]=useState(null);
  const [error,setError]=useState("");
  const [loginStudents,setLoginStudents]=useState([]);
  const [reviews,setReviews]=useState([]);
  const [deferredPrompt,setDeferredPrompt]=useState(null);
  const [showInstall,setShowInstall]=useState(false);
  useEffect(()=>{
    supabase.from("students").select("id,name,cls,password").order("cls").order("name").then(({data})=>{if(data){setLoginStudents(data);if(data.length>0)setSelStudentId(data[0].id);}});
    supabase.from("reviews").select("student_name,cls,rating,content").eq("status","approved").order("approved_at",{ascending:false}).limit(20).then(({data})=>{if(data)setReviews(data);});
    const handler=(e)=>{e.preventDefault();setDeferredPrompt(e);setShowInstall(true);};
    window.addEventListener("beforeinstallprompt",handler);
    window.addEventListener("appinstalled",()=>setShowInstall(false));
    return()=>window.removeEventListener("beforeinstallprompt",handler);
  },[]);
  const handleInstall=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();const{outcome}=await deferredPrompt.userChoice;if(outcome==="accepted")setShowInstall(false);setDeferredPrompt(null);};
  const handleTeacherLogin=()=>{if(password===TEACHER_PASSWORD){onTeacherLogin();}else{setError("비밀번호가 틀렸습니다.");setPassword("");}};
  const handleStudentLogin=()=>{const s=loginStudents.find(x=>x.id===selStudentId);if(!s)return;if(password===String(s.password)){const full=STUDENTS.find(x=>x.id===s.id)||s;onStudentLogin(full);}else{setError("비밀번호가 틀렸습니다.");setPassword("");}};
  return(
    <div style={{minHeight:"100vh",fontFamily:"-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Segoe UI',sans-serif",position:"relative",overflowX:"hidden",background:"linear-gradient(160deg,#0a0a14 0%,#0e1020 40%,#080c18 100%)"}}>
      <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:0,pointerEvents:"none"}}>
        <div style={{position:"absolute",top:"-20%",left:"50%",transform:"translateX(-50%)",width:"80%",height:"60%",background:"radial-gradient(ellipse,rgba(30,60,120,0.25) 0%,transparent 70%)"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"40%",background:"linear-gradient(to top,rgba(0,0,0,0.7),transparent)"}}/>
        <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:0.04}} xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
      </div>
      <div style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem 1rem 1rem",flexWrap:"wrap",gap:20}}>
          <div style={{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(16px)",borderRadius:20,padding:"28px 24px",width:210,border:"1px solid rgba(255,255,255,0.12)",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",textAlign:"center",flexShrink:0}}>
            <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#2D5BE3,#5B8DEF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 14px",boxShadow:"0 4px 16px rgba(45,91,227,0.4)"}}>👨‍🏫</div>
            <div style={{fontSize:18,fontWeight:700,color:"white",marginBottom:4}}>박홍규 영어</div>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#4CAF7D",margin:"0 auto 14px",boxShadow:"0 0 8px #4CAF7D"}}/>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",lineHeight:2}}><div>고려대학교 사범대</div><div>현 각인학원</div><div>글읽기 Code반</div><div>4년 연속 50명 마감</div></div>
            <div style={{marginTop:14,fontSize:11,color:"rgba(255,255,255,0.35)",letterSpacing:"0.05em"}}>영어의 자신감을 키우는 곳</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.96)",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:320,boxShadow:"0 8px 32px rgba(0,0,0,0.3)",flexShrink:0}}>
            {!mode&&(<><div style={{fontSize:11,fontWeight:600,color:"#888780",letterSpacing:"0.08em",marginBottom:6}}>WELCOME</div><div style={{fontSize:20,fontWeight:700,color:"#1A1A2E",marginBottom:20,lineHeight:1.4}}>흐릿한 시작을,<br/><span style={{color:"#2D5BE3"}}>뚜렷한 선택으로</span></div><div style={{display:"flex",flexDirection:"column",gap:10}}><button onClick={()=>setMode("teacher")} style={{padding:"14px 16px",borderRadius:12,border:"1.5px solid #E8E6DF",background:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:12}} onMouseEnter={e=>e.currentTarget.style.borderColor="#2D5BE3"} onMouseLeave={e=>e.currentTarget.style.borderColor="#E8E6DF"}><div style={{width:40,height:40,borderRadius:10,background:"#EBF2FA",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>👩‍🏫</div><div style={{textAlign:"left"}}><div style={{fontSize:14,fontWeight:600,color:"#1A1A2E"}}>강사 모드</div><div style={{fontSize:11,color:"#888780",marginTop:2}}>출석·점수·채점·리포트</div></div><div style={{marginLeft:"auto",fontSize:18,color:"#C0BEB8"}}>›</div></button><button onClick={()=>setMode("student")} style={{padding:"14px 16px",borderRadius:12,border:"1.5px solid #E8E6DF",background:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:12}} onMouseEnter={e=>e.currentTarget.style.borderColor="#2D5BE3"} onMouseLeave={e=>e.currentTarget.style.borderColor="#E8E6DF"}><div style={{width:40,height:40,borderRadius:10,background:"#E6F4ED",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🎒</div><div style={{textAlign:"left"}}><div style={{fontSize:14,fontWeight:600,color:"#1A1A2E"}}>학생 모드</div><div style={{fontSize:11,color:"#888780",marginTop:2}}>성적·출석·과제물 확인</div></div><div style={{marginLeft:"auto",fontSize:18,color:"#C0BEB8"}}>›</div></button></div>{showInstall&&<button onClick={handleInstall} style={{marginTop:12,width:"100%",fontSize:13,padding:"10px",borderRadius:10,border:"none",background:"#2D5BE3",color:"white",cursor:"pointer",fontWeight:600}}>📲 앱 설치하기</button>}</>)}
            {mode==="teacher"&&(<><div style={{fontSize:11,fontWeight:600,color:"#888780",letterSpacing:"0.08em",marginBottom:6}}>TEACHER</div><div style={{fontSize:18,fontWeight:700,color:"#1A1A2E",marginBottom:20}}>강사 로그인</div><div style={{marginBottom:14}}><div style={{fontSize:11,fontWeight:600,color:"#888780",marginBottom:6}}>비밀번호</div><input type="password" value={password} onChange={e=>{setPassword(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&handleTeacherLogin()} placeholder="비밀번호 입력" style={{width:"100%",fontSize:14,padding:"11px 14px",borderRadius:10,border:`1.5px solid ${error?"#E24B4A":"#E8E6DF"}`,background:"#FAFAF8",color:"#1A1A2E",boxSizing:"border-box",outline:"none"}}/>{error&&<div style={{fontSize:12,color:"#E24B4A",marginTop:5,fontWeight:500}}>{error}</div>}</div><button onClick={handleTeacherLogin} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:"#2D5BE3",color:"white",fontSize:14,fontWeight:700,cursor:"pointer"}}>로그인</button><button onClick={()=>{setMode(null);setError("");setPassword("");}} style={{width:"100%",fontSize:13,color:"#888780",background:"transparent",border:"none",cursor:"pointer",marginTop:10,padding:"6px"}}>← 뒤로가기</button></>)}
            {mode==="student"&&(<><div style={{fontSize:11,fontWeight:600,color:"#888780",letterSpacing:"0.08em",marginBottom:6}}>STUDENT</div><div style={{fontSize:18,fontWeight:700,color:"#1A1A2E",marginBottom:20}}>학생 로그인</div><div style={{marginBottom:12}}><div style={{fontSize:11,fontWeight:600,color:"#888780",marginBottom:6}}>이름 선택</div><select value={selStudentId||""} onChange={e=>{setSelStudentId(parseInt(e.target.value));setError("");setPassword("");}} style={{width:"100%",fontSize:14,padding:"11px 14px",borderRadius:10,border:"1.5px solid #E8E6DF",background:"#FAFAF8",color:"#1A1A2E",boxSizing:"border-box"}}>{loginStudents.map(s=><option key={s.id} value={s.id}>{s.name} ({s.cls}반)</option>)}</select></div><div style={{marginBottom:16}}><div style={{fontSize:11,fontWeight:600,color:"#888780",marginBottom:6}}>비밀번호</div><input type="password" value={password} onChange={e=>{setPassword(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&handleStudentLogin()} placeholder="본인 비밀번호 입력" style={{width:"100%",fontSize:14,padding:"11px 14px",borderRadius:10,border:`1.5px solid ${error?"#E24B4A":"#E8E6DF"}`,background:"#FAFAF8",color:"#1A1A2E",boxSizing:"border-box",outline:"none"}}/>{error&&<div style={{fontSize:12,color:"#E24B4A",marginTop:5,fontWeight:500}}>{error}</div>}</div><button onClick={handleStudentLogin} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:"#2D5BE3",color:"white",fontSize:14,fontWeight:700,cursor:"pointer"}}>입장하기</button><button onClick={()=>{setMode(null);setError("");setPassword("");}} style={{width:"100%",fontSize:13,color:"#888780",background:"transparent",border:"none",cursor:"pointer",marginTop:10,padding:"6px"}}>← 뒤로가기</button></>)}
          </div>
        </div>
        <div style={{paddingBottom:24}}><div style={{textAlign:"center",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.3)",letterSpacing:"0.12em",marginBottom:14}}>STUDENT REVIEWS</div><ReviewBanner reviews={reviews}/></div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// 과제물 관리 (강사 전용 — 파일 추가/삭제)
// ════════════════════════════════════════════════
function HomeworkManage({files,setFiles}){
  const [showForm,setShowForm]     = useState(false);
  const [form,setForm]             = useState({
    title:"",subj:"문법",due:"",desc:"",url:"",
    targetType:"전체",
    targetCls:[],
    targetStudents:[],
    answer_key_id:"",
    examType:"과제물",
  });
  const [successMsg,setSuccessMsg] = useState("");
  const [filterCls,setFilterCls]   = useState("all");
  const [answerKeys,setAnswerKeys] = useState([]);
  const subjColor={문법:"blue",독해:"green",어휘:"amber",듣기:"purple",수능:"red"};

  // 정답지 목록 로드
  useEffect(()=>{
    supabase.from("answer_keys").select("id,title,week,test_date,q_count").order("created_at",{ascending:false})
      .then(({data})=>setAnswerKeys(data||[]));
  },[]);

  // 공개 대상 계산
  const getClsFromTarget=(f)=>{
    if(!f.target_students||f.target_students.length===0) return f.cls||"전체";
    return "개인";
  };
  const filtered = files.filter(f=>filterCls==="all"||getClsFromTarget(f)===filterCls||f.cls===filterCls||f.cls==="전체");

  const toggleCls=(cls)=>{
    setForm(prev=>{
      const arr=prev.targetCls.includes(cls)?prev.targetCls.filter(c=>c!==cls):[...prev.targetCls,cls];
      return {...prev,targetCls:arr};
    });
  };
  const toggleStudent=(id)=>{
    setForm(prev=>{
      const arr=prev.targetStudents.includes(id)?prev.targetStudents.filter(s=>s!==id):[...prev.targetStudents,id];
      return {...prev,targetStudents:arr};
    });
  };

  const addFile=async()=>{
    if(!form.title.trim()){alert("제목을 입력해주세요.");return;}
    if(!form.url.trim()){alert("구글 드라이브 링크를 입력해주세요.");return;}
    // cls 결정
    let cls="전체";
    let targetStudents=[];
    if(form.targetType==="반별"){
      cls=form.targetCls.length===1?form.targetCls[0]:"전체";
    } else if(form.targetType==="개인별"){
      cls="전체";
      targetStudents=form.targetStudents;
    }
    const newFile={
      title:form.title, subj:form.subj, cls,
      date:new Date().toLocaleDateString("ko-KR").replace(/\. /g,".").replace(/\.$/,""),
      due:form.due||null, is_new:true, description:form.desc, url:form.url,
      target_students:targetStudents,
      answer_key_id:form.answer_key_id?parseInt(form.answer_key_id):null,
      exam_type:form.examType,
    };
    const {data,error}=await supabase.from("homework_files").insert(newFile).select().single();
    if(error){alert("저장 중 오류가 발생했습니다.");return;}
    setFiles(prev=>[{...data,isNew:data.is_new,desc:data.description},...prev]);
    setForm({title:"",subj:"문법",due:"",desc:"",url:"",targetType:"전체",targetCls:[],targetStudents:[],answer_key_id:"",examType:"과제물"});
    setShowForm(false);
    setSuccessMsg(`"${form.title}" 업로드 완료!`);
    setTimeout(()=>setSuccessMsg(""),3000);
  };

  const deleteFile=async(id)=>{
    const f=files.find(x=>x.id===id);
    if(!window.confirm(`"${f.title}"을 삭제할까요?`))return;
    const {error}=await supabase.from("homework_files").delete().eq("id",id);
    if(error){alert("삭제 중 오류가 발생했습니다.");return;}
    setFiles(prev=>prev.filter(x=>x.id!==id));
    setSuccessMsg("삭제되었습니다.");
    setTimeout(()=>setSuccessMsg(""),3000);
  };

  // 공개 대상 표시 텍스트
  const targetText=(f)=>{
    if(f.target_students&&f.target_students.length>0){
      const names=f.target_students.map(id=>STUDENTS.find(s=>s.id===id)?.name||"").filter(Boolean);
      return {label:`개인 (${names.join(", ")})`,type:"purple"};
    }
    if(f.cls==="전체") return {label:"전체 공개",type:"gray"};
    return {label:f.cls+"반",type:{A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"}[f.cls]||"gray"};
  };

  return(
    <div>
      <SuccessBox msg={successMsg}/>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <BtnPrimary onClick={()=>setShowForm(!showForm)}>{showForm?"취소":"+ 새 과제물 추가"}</BtnPrimary>
      </div>

      {showForm&&(
        <Card mb={16}>
          <SectionTitle>새 과제물 추가</SectionTitle>

          {/* 시험 유형 선택 */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,color:"#888780",marginBottom:6}}>시험 유형 *</div>
            <div style={{display:"flex",gap:8}}>
              {[["과제물","📁"],["모의고사","📄"],["내신","🏫"]].map(([type,icon])=>(
                <button key={type} onClick={()=>setForm({...form,examType:type})}
                  style={{flex:1,padding:"10px",borderRadius:10,cursor:"pointer",border:`1.5px solid ${form.examType===type?"#185FA5":"#D3D1C7"}`,background:form.examType===type?"#E6F1FB":"white",color:form.examType===type?"#185FA5":"#888780",fontWeight:form.examType===type?600:400,fontSize:13}}>
                  {icon} {type}
                </button>
              ))}
            </div>
          </div>
          <div style={{background:"#E6F1FB",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#0C447C",marginBottom:16,lineHeight:1.7}}>
            <div style={{fontWeight:500,marginBottom:4}}>📎 구글 드라이브 링크 가져오는 방법</div>
            <div>① 구글 드라이브에서 파일 우클릭 → "공유" → "링크가 있는 모든 사용자" → 링크 복사</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <div style={{fontSize:12,color:"#888780",marginBottom:4}}>제목 *</div>
              <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="예: 3월 4주차 문법 과제"
                style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{fontSize:12,color:"#888780",marginBottom:4}}>과목</div>
              <select value={form.subj} onChange={e=>setForm({...form,subj:e.target.value})}
                style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}>
                {["문법","독해","어휘","듣기","수능"].map(v=><option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:12,color:"#888780",marginBottom:4}}>마감일 (선택)</div>
              <input value={form.due} onChange={e=>setForm({...form,due:e.target.value})} placeholder="예: 4월 1일"
                style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{fontSize:12,color:"#888780",marginBottom:4}}>설명 (선택)</div>
              <input value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} placeholder="파일 내용 간단히 설명"
                style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
            </div>
          </div>

          {/* 공개 대상 설정 */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:"#888780",marginBottom:8,fontWeight:500}}>📂 공개 대상</div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              {[["전체","전체 공개"],["반별","반별 공개"],["개인별","개인별 공개"]].map(([v,label])=>(
                <button key={v} onClick={()=>setForm({...form,targetType:v,targetCls:[],targetStudents:[]})}
                  style={{padding:"6px 14px",borderRadius:8,cursor:"pointer",border:`0.5px solid ${form.targetType===v?"#185FA5":"#D3D1C7"}`,background:form.targetType===v?"#E6F1FB":"transparent",color:form.targetType===v?"#185FA5":"#888780",fontWeight:form.targetType===v?500:400,fontSize:12}}>
                  {label}
                </button>
              ))}
            </div>

            {form.targetType==="반별"&&(
              <div style={{background:"#F1EFE8",borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:11,color:"#888780",marginBottom:6}}>공개할 반 선택 (복수 선택 가능)</div>
                <div style={{display:"flex",gap:6}}>
                  {["A","B","C","D","E","F"].map(cls=>(
                    <button key={cls} onClick={()=>toggleCls(cls)}
                      style={{padding:"6px 16px",borderRadius:8,cursor:"pointer",border:`0.5px solid ${form.targetCls.includes(cls)?"#185FA5":"#D3D1C7"}`,background:form.targetCls.includes(cls)?"#E6F1FB":"white",color:form.targetCls.includes(cls)?"#185FA5":"#888780",fontWeight:500,fontSize:13}}>
                      {cls}반
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.targetType==="개인별"&&(
              <div style={{background:"#F1EFE8",borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:11,color:"#888780",marginBottom:8}}>공개할 학생 선택 (복수 선택 가능)</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {STUDENTS.map(s=>(
                    <button key={s.id} onClick={()=>toggleStudent(s.id)}
                      style={{padding:"5px 12px",borderRadius:8,cursor:"pointer",border:`0.5px solid ${form.targetStudents.includes(s.id)?"#185FA5":"#D3D1C7"}`,background:form.targetStudents.includes(s.id)?"#E6F1FB":"white",color:form.targetStudents.includes(s.id)?"#185FA5":"#888780",fontSize:12,fontWeight:form.targetStudents.includes(s.id)?500:400}}>
                      {s.name} <span style={{fontSize:10,color:"#888780"}}>({s.cls}반)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:"#888780",marginBottom:4}}>📝 연결할 정답지 (선택)</div>
            <select value={form.answer_key_id} onChange={e=>setForm({...form,answer_key_id:e.target.value})}
              style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box",color:form.answer_key_id?"#2C2C2A":"#888780"}}>
              <option value="">연결 안함 (다운로드만 가능)</option>
              {answerKeys.map(k=>(
                <option key={k.id} value={k.id}>{k.title||k.week} ({k.test_date} · {k.q_count}문항)</option>
              ))}
            </select>
            {form.answer_key_id&&(
              <div style={{fontSize:11,color:"#27500A",marginTop:4}}>✓ 학생이 이 과제물에서 바로 채점할 수 있어요</div>
            )}
          </div>

          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:"#888780",marginBottom:4}}>구글 드라이브 공유 링크 *</div>
            <input value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="https://drive.google.com/file/d/..."
              style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
          </div>

          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <BtnSecondary onClick={()=>{setShowForm(false);setForm({title:"",subj:"문법",due:"",desc:"",url:"",targetType:"전체",targetCls:[],targetStudents:[],answer_key_id:""});}}>취소</BtnSecondary>
            <BtnPrimary onClick={addFile}>추가 완료</BtnPrimary>
          </div>
        </Card>
      )}

      <div style={{marginBottom:12}}><ClassFilter value={filterCls} onChange={setFilterCls}/></div>

      {filtered.length===0?(
        <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13}}>등록된 과제물이 없어요</div>
      ):(
        <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:"#F1EFE8"}}>
              {["제목","과목","공개 대상","채점 연결","마감일","등록일","링크","삭제"].map((h,i)=>(
                <th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(f=>{
                const t=targetText(f);
                return(
                  <tr key={f.id} style={{borderBottom:"0.5px solid #D3D1C7"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"8px 12px"}}>
                      <div style={{fontWeight:500}}>{f.title}</div>
                      {f.desc&&<div style={{fontSize:11,color:"#888780",marginTop:2}}>{f.desc}</div>}
                      {f.isNew&&<Badge label="NEW" type="blue"/>}
                    </td>
                    <td style={{padding:"8px 12px"}}><Badge label={f.subj} type={subjColor[f.subj]||"gray"}/></td>
                    <td style={{padding:"8px 12px"}}><Badge label={t.label} type={t.type}/></td>
                    <td style={{padding:"8px 12px"}}>
                      {f.answer_key_id?(
                        <Badge label={answerKeys.find(k=>k.id===f.answer_key_id)?.title||"연결됨"} type="green"/>
                      ):(
                        <span style={{fontSize:11,color:"#888780"}}>—</span>
                      )}
                    </td>
                    <td style={{padding:"8px 12px",fontSize:12,color:"#888780"}}>{f.due||"—"}</td>
                    <td style={{padding:"8px 12px",fontSize:12,color:"#888780"}}>{f.date}</td>
                    <td style={{padding:"8px 12px"}}>
                      <a href={f.url} target="_blank" rel="noreferrer"
                        style={{fontSize:12,color:"#185FA5",textDecoration:"none",background:"#E6F1FB",padding:"3px 8px",borderRadius:6}}>
                        링크 확인
                      </a>
                    </td>
                    <td style={{padding:"8px 12px"}}>
                      <button onClick={()=>deleteFile(f.id)}
                        style={{fontSize:11,color:"#791F1F",background:"#FCEBEB",border:"none",padding:"3px 8px",borderRadius:6,cursor:"pointer"}}>
                        삭제
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
function HomeworkStudent({student,files}){
  const subjColor={문법:"blue",독해:"green",어휘:"amber",듣기:"purple",수능:"red"};
  const [answerKeys,setAnswerKeys]   = useState([]);
  const [openGrading,setOpenGrading] = useState(null); // 채점 열린 파일 id
  const [myAns,setMyAns]             = useState([]);
  const [result,setResult]           = useState(null);
  const [history,setHistory]         = useState({}); // {keyId: omr_result}

  useEffect(()=>{
    // 정답지 목록 + 내가 이미 제출한 결과 로드
    Promise.all([
      supabase.from("answer_keys").select("*").order("created_at",{ascending:false}),
      supabase.from("omr_results").select("*").eq("student_id",student.id),
    ]).then(([{data:keys},{data:hist}])=>{
      setAnswerKeys(keys||[]);
      // keyId 기준으로 가장 최신 결과 저장
      const h={};
      (hist||[]).forEach(r=>{
        if(!h[r.answer_key_id]) h[r.answer_key_id]=r;
      });
      setHistory(h);
    });
  },[student.id]);

  // 본인 공개 파일 필터
  const myFiles=files.filter(f=>{
    if(f.target_students&&f.target_students.length>0) return f.target_students.includes(student.id);
    return f.cls==="전체"||f.cls===student.cls;
  });

  // answer_key_id로 직접 매칭 (없으면 제목 유사도 매칭)
  const findKey=(f)=>{
    if(f.answer_key_id) return answerKeys.find(k=>k.id===f.answer_key_id)||null;
    return null;
  };

  const openOMR=(key)=>{
    setOpenGrading(key.id);
    setResult(null);
    // 이미 제출한 경우 결과 바로 표시
    if(history[key.id]){
      setResult(history[key.id]);
      setMyAns(history[key.id].my_answers||[]);
    } else {
      setMyAns(Array(key.q_count).fill(0));
    }
  };

  const mark=(i,v,key)=>{
    if(result) return;
    setMyAns(prev=>{const a=[...prev];a[i]=a[i]===v?0:v;return a;});
  };

  const grade=async(key)=>{
    if(myAns.every(a=>a===0)){alert("답안을 먼저 입력해주세요.");return;}
    const answers=key.answers;
    const correct=myAns.filter((v,i)=>v===answers[i]).length;
    const score=Math.round(correct/key.q_count*100);
    const wrong=myAns.map((v,i)=>v!==answers[i]?i+1:null).filter(Boolean);
    const res={correct,total:key.q_count,score,wrong,my_answers:myAns};
    const {data:saved}=await supabase.from("omr_results").insert({
      student_id:student.id, student_name:student.name, cls:student.cls,
      answer_key_id:key.id, week:key.week, test_date:key.test_date,
      title:key.title||key.week, my_answers:myAns, score, correct,
      total:key.q_count, wrong,
    }).select().single();
    setResult(res);
    if(saved) setHistory(prev=>({...prev,[key.id]:saved}));
    // 과제 7연속 자동 체크
    await checkHwStreak(student.id, student.name, student.cls);
  };

  const chunkSize=15;
  const pct=result?.score||0;
  const gradeLabel=pct>=90?"A":pct>=80?"B":pct>=70?"C":pct>=60?"D":"F";
  const gradeColor=pct>=90?"#27500A":pct>=80?"#0C447C":pct>=70?"#633806":"#791F1F";
  const gradeBg   =pct>=90?"#EAF3DE":pct>=80?"#E6F1FB":pct>=70?"#FAEEDA":"#FCEBEB";
  const barCol    =pct>=80?"#639922":pct>=65?"#BA7517":"#E24B4A";

  if(myFiles.length===0){
    return <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13}}>아직 등록된 과제물이 없어요</div>;
  }

  return(
    <div>
      {myFiles.map(f=>{
        const matchKey=findKey(f);
        const isOpen=openGrading===matchKey?.id;
        const submitted=matchKey?!!history[matchKey.id]:false;
        return(
          <div key={f.id} style={{background:"white",border:`0.5px solid ${f.isNew?"#185FA5":"#D3D1C7"}`,borderRadius:12,marginBottom:12,overflow:"hidden"}}>
            {/* 파일 정보 */}
            <div style={{padding:"1rem"}}>
              <div style={{display:"flex",gap:10,marginBottom:8}}>
                <div style={{width:36,height:44,borderRadius:6,background:"#FCEBEB",color:"#791F1F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:500,flexShrink:0}}>PDF</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A",lineHeight:1.4}}>{f.title}</div>
                  {f.desc&&<div style={{fontSize:11,color:"#888780",marginTop:3}}>{f.desc}</div>}
                </div>
              </div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                <Badge label={f.subj} type={subjColor[f.subj]||"gray"}/>
                {f.isNew&&<Badge label="NEW" type="blue"/>}
                {f.due&&<Badge label={`마감 ${f.due}`} type="gray"/>}
                {matchKey&&!submitted&&<Badge label="채점 가능" type="green"/>}
                {matchKey&&submitted&&<Badge label="채점 완료" type="blue"/>}
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:8,borderTop:"0.5px solid #F1EFE8",flexWrap:"wrap",gap:8}}>
                <span style={{fontSize:11,color:"#888780"}}>{f.date} 등록</span>
                <div style={{display:"flex",gap:8}}>
                  <a href={f.url} target="_blank" rel="noreferrer"
                    style={{fontSize:12,fontWeight:500,color:"#185FA5",background:"#E6F1FB",border:"none",padding:"6px 14px",borderRadius:6,textDecoration:"none"}}>
                    ↓ 다운로드
                  </a>
                  {matchKey&&(
                    <button onClick={()=>{
                      if(isOpen){setOpenGrading(null);setResult(null);}
                      else openOMR(matchKey);
                    }}
                      style={{fontSize:12,fontWeight:500,color:isOpen?"#888780":submitted?"#0C447C":"#27500A",background:isOpen?"#F1EFE8":submitted?"#E6F1FB":"#EAF3DE",border:"none",padding:"6px 14px",borderRadius:6,cursor:"pointer"}}>
                      {isOpen?"▲ 접기":submitted?"📊 결과 보기":"📝 채점하기"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* OMR 채점 패널 */}
            {isOpen&&matchKey&&(
              <div style={{borderTop:"0.5px solid #D3D1C7",background:"#F1EFE8",padding:"1rem"}}>
                <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A",marginBottom:10}}>
                  📝 {matchKey.title||matchKey.week} — {matchKey.q_count}문항
                  {submitted&&<span style={{fontSize:11,color:"#888780",marginLeft:8,fontWeight:400}}>이미 제출한 시험이에요</span>}
                </div>

                {submitted?(
                  /* 이미 제출 — 읽기 전용 */
                  <div>
                    {/* 점수 요약 */}
                    <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                      <div style={{background:gradeBg,borderRadius:8,padding:"8px 14px",display:"flex",alignItems:"baseline",gap:4}}>
                        <span style={{fontSize:24,fontWeight:500,color:gradeColor}}>{pct}</span>
                        <span style={{fontSize:12,color:gradeColor}}>점</span>
                        <span style={{fontSize:14,fontWeight:500,color:gradeColor,marginLeft:4}}>{gradeLabel}등급</span>
                      </div>
                      <div style={{background:"#EAF3DE",borderRadius:8,padding:"8px 14px",fontSize:13,color:"#27500A"}}>정답 {result?.correct||history[matchKey.id]?.correct}개</div>
                      <div style={{background:"#FCEBEB",borderRadius:8,padding:"8px 14px",fontSize:13,color:"#791F1F"}}>오답 {result?.wrong?.length||history[matchKey.id]?.wrong?.length||0}개</div>
                    </div>
                    {/* 읽기 전용 OMR */}
                    {(()=>{
                      const rec=history[matchKey.id];
                      const chunks=[];
                      for(let i=0;i<matchKey.q_count;i+=chunkSize) chunks.push([i,Math.min(i+chunkSize,matchKey.q_count)]);
                      return(
                        <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(chunks.length,3)},1fr)`,gap:10}}>
                          {chunks.map(([s,e])=>(
                            <div key={s}>
                              <div style={{fontSize:10,fontWeight:500,color:"#888780",marginBottom:4}}>{s+1}~{e}번</div>
                              {Array.from({length:e-s},(_,j)=>{
                                const i=s+j;
                                const myA=(rec?.my_answers||[])[i];
                                return(
                                  <div key={i} style={{display:"flex",alignItems:"center",gap:3,marginBottom:3}}>
                                    <span style={{fontSize:10,color:"#888780",width:20,textAlign:"right",flexShrink:0}}>{i+1}</span>
                                    <div style={{display:"flex",gap:2}}>
                                      {[1,2,3,4,5].map(v=>{
                                        const isSel=myA===v;
                                        const isCorrect=matchKey.answers[i]===v;
                                        let bg="transparent",color="#888780",border="0.5px solid #D3D1C7";
                                        if(isSel&&isCorrect){bg="#EAF3DE";color="#27500A";border="0.5px solid #97C459";}
                                        else if(isSel&&!isCorrect){bg="#FCEBEB";color="#791F1F";border="0.5px solid #F09595";}
                                        else if(!isSel&&isCorrect&&myA!==0){bg="#EAF3DE";color="#27500A";border="0.5px solid #97C459";}
                                        return <div key={v} style={{width:20,height:16,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,background:bg,color,border,cursor:"default"}}>{v}</div>;
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                    <div style={{fontSize:11,color:"#888780",marginTop:10,textAlign:"center"}}>수정이 필요하면 선생님께 문의하세요</div>
                  </div>
                ):(
                  /* 아직 미제출 — 입력 가능 */
                  <div>
                    {(()=>{
                      const chunks=[];
                      for(let i=0;i<matchKey.q_count;i+=chunkSize) chunks.push([i,Math.min(i+chunkSize,matchKey.q_count)]);
                      return(
                        <>
                          {result?(
                            /* 채점 결과 */
                            <>
                              <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                                <div style={{background:gradeBg,borderRadius:8,padding:"8px 14px",display:"flex",alignItems:"baseline",gap:4}}>
                                  <span style={{fontSize:24,fontWeight:500,color:gradeColor}}>{pct}</span>
                                  <span style={{fontSize:12,color:gradeColor}}>점</span>
                                  <span style={{fontSize:14,fontWeight:500,color:gradeColor,marginLeft:4}}>{gradeLabel}등급</span>
                                </div>
                                <div style={{background:"#EAF3DE",borderRadius:8,padding:"8px 14px",fontSize:13,color:"#27500A"}}>정답 {result.correct}개</div>
                                <div style={{background:"#FCEBEB",borderRadius:8,padding:"8px 14px",fontSize:13,color:"#791F1F"}}>오답 {result.wrong.length}개</div>
                              </div>
                              {result.wrong.length>0&&(
                                <div style={{marginBottom:10}}>
                                  <div style={{fontSize:12,color:"#888780",marginBottom:4}}>틀린 문항</div>
                                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                                    {result.wrong.map(qn=>(
                                      <span key={qn} style={{padding:"2px 8px",borderRadius:6,background:"#FCEBEB",fontSize:11,color:"#791F1F"}}>{qn}번 <span style={{fontSize:10}}>정답:{matchKey.answers[qn-1]}</span></span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div style={{fontSize:11,color:"#888780",textAlign:"center",background:"white",borderRadius:6,padding:"6px"}}>채점 완료! 수정이 필요하면 선생님께 문의하세요.</div>
                            </>
                          ):(
                            /* OMR 입력 */
                            <>
                              <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(chunks.length,3)},1fr)`,gap:10,marginBottom:12}}>
                                {chunks.map(([s,e])=>(
                                  <div key={s}>
                                    <div style={{fontSize:10,fontWeight:500,color:"#888780",marginBottom:4}}>{s+1}~{e}번</div>
                                    {Array.from({length:e-s},(_,j)=>{
                                      const i=s+j;
                                      return(
                                        <div key={i} style={{display:"flex",alignItems:"center",gap:3,marginBottom:3}}>
                                          <span style={{fontSize:10,color:"#888780",width:20,textAlign:"right",flexShrink:0}}>{i+1}</span>
                                          <div style={{display:"flex",gap:2}}>
                                            {[1,2,3,4,5].map(v=>{
                                              const isSel=myAns[i]===v;
                                              const bg=isSel?"#185FA5":"transparent";
                                              const color=isSel?"#E6F1FB":"#888780";
                                              const border=isSel?"0.5px solid #185FA5":"0.5px solid #D3D1C7";
                                              return <div key={v} onClick={()=>mark(i,v,matchKey)} style={{width:20,height:16,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,cursor:"pointer",background:bg,color,border}}>{v}</div>;
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ))}
                              </div>
                              <button onClick={()=>grade(matchKey)}
                                style={{width:"100%",padding:"10px",borderRadius:8,border:"none",background:"#185FA5",color:"white",fontSize:13,fontWeight:500,cursor:"pointer"}}>
                                채점하기 (1회만 가능)
                              </button>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
function Dashboard({onSelectStudent,attendanceData,scoresData}){
  const [filterCls,setFilterCls]=useState("all");
  const [filterStatus,setFilterStatus]=useState("all");
  const [search,setSearch]=useState("");
  const clsColor={A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"};

  // DB 데이터로 학생 정보 보강
  const enriched = STUDENTS.map(s=>{
    const myAtt = attendanceData[s.id]||[];
    const mySc  = scoresData[s.id]||[];
    const attendPct = myAtt.length>0
      ? Math.round(myAtt.filter(r=>r.status==="O").length/myAtt.length*100)
      : s.attend;
    const latestScore = mySc.length>0 ? mySc[0].score : s.score;
    const warn = attendPct<75 || latestScore<70;
    return {...s, attend:attendPct, score:latestScore, status:warn?"warn":"ok"};
  });

  const filtered = enriched.filter(s=>
    (filterCls==="all"||s.cls===filterCls)&&
    (filterStatus==="all"||s.status===filterStatus)&&
    (!search||s.name.includes(search))
  );

  const attendAvg = Math.round(enriched.reduce((a,b)=>a+b.attend,0)/enriched.length);
  const scoreAvg  = Math.round(enriched.reduce((a,b)=>a+b.score,0)/enriched.length);
  const warnCount = enriched.filter(s=>s.status==="warn").length;
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
        <KpiCard label="전체 학생"     value={`${STUDENTS.length}명`} sub="3개 반"/>
        <KpiCard label="평균 출석률"   value={`${attendAvg}%`} sub="이번 달"/>
        <KpiCard label="단어시험 평균" value={`${scoreAvg}점`} sub="이번 주"/>
        <KpiCard label="주의 학생"     value={`${warnCount}명`} sub="관리 필요" valueColor="#E24B4A"/>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <ClassFilter value={filterCls} onChange={setFilterCls}/>
        <button onClick={()=>setFilterStatus(filterStatus==="warn"?"all":"warn")} style={{fontSize:12,padding:"5px 14px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:filterStatus==="warn"?"#F09595":"#D3D1C7",background:filterStatus==="warn"?"#FCEBEB":"transparent",color:filterStatus==="warn"?"#791F1F":"#888780"}}>주의 학생만</button>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="이름 검색..." style={{fontSize:13,padding:"5px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",background:"white",color:"#2C2C2A",flex:1,minWidth:120}}/>
      </div>
      <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"#F1EFE8"}}>{["#","이름","반","출석률","단어시험","등수","상태",""].map((h,i)=><th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map((s,i)=>(
              <tr key={s.id} style={{borderBottom:"0.5px solid #D3D1C7",cursor:"pointer"}} onClick={()=>onSelectStudent(s)}
                onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{i+1}</td>
                <td style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={s.name} idx={s.id} size={28}/><span>{s.name}</span></div></td>
                <td style={{padding:"8px 12px"}}><Badge label={clsLabel(s.cls)} type={clsColor[s.cls]}/></td>
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

function StudentDetail({student,onBack}){
  const clsColor={A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"};
  const progColor=v=>v>=85?"#639922":v>=70?"#BA7517":"#E24B4A";
  const latest=SCORE_HISTORY[SCORE_HISTORY.length-1].s;
  const diff=latest-SCORE_HISTORY[SCORE_HISTORY.length-2].s;
  const attArr=MONTH_ATT[student.id]||[];
  const attendCount=attArr.filter(v=>v===1).length;
  const progress=PROGRESS_LABELS.map((l,i)=>[l,[90,85,92,88,80,83][i]]);
  // 반 내 등수·합격 (StudentDetail은 하드코딩 데이터 기반 — 실제는 리포트에서 확인)
  const clsStudents = STUDENTS.filter(s=>s.cls===student.cls);
  const myRankInCls = student.rank||null;
  const passCount   = student.pass||0;
  return(
    <div>
      <BtnSecondary onClick={onBack} style={{marginBottom:16}}>← 목록으로</BtnSecondary>
      <Card mb={12}>
        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          <Avatar name={student.name} idx={student.id} size={52}/>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:500,marginBottom:4}}>{student.name}</div>
            <div style={{fontSize:13,color:"#888780",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <Badge label={clsLabel(student.cls)} type={clsColor[student.cls]}/><span>{student.grade}</span><span>·</span><span>{student.course}</span><span>·</span><span>{student.phone}</span>
            </div>
          </div>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
        <KpiCard label="최근 단어시험" value={latest+"점"} sub={diff>0?`▲${diff}점`:`▼${Math.abs(diff)}점`} valueColor={diff>=0?"#27500A":"#E24B4A"}/>
        <KpiCard label="반 내 등수"    value={myRankInCls!==null?myRankInCls+"위":"—"} sub={`${student.cls}반 ${clsStudents.length}명 중`}/>
        <KpiCard label="출석률"        value={Math.round(attendCount/attArr.length*100)+"%"} sub={`${attendCount}/${attArr.length}회`}/>
        <KpiCard label="단어시험 합격" value={passCount+"회"} sub="누적"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Card mb={0}>
          <SectionTitle>단어시험 점수 추이</SectionTitle>
          {[...SCORE_HISTORY].reverse().map((x,i)=>{const col=x.s>=85?"#639922":x.s>=70?"#BA7517":"#E24B4A";return(<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}><span style={{fontSize:11,color:"#888780",width:60,flexShrink:0}}>{x.wk}</span><div style={{flex:1,background:"#F1EFE8",borderRadius:99,height:7,overflow:"hidden"}}><div style={{width:x.s+"%",height:"100%",background:col,borderRadius:99}}/></div><span style={{fontSize:12,fontWeight:500,color:col,width:30,textAlign:"right"}}>{x.s}</span><Badge label={x.s>=70?"합격":"불합격"} type={x.s>=70?"green":"red"}/></div>);})}
        </Card>
        <Card mb={0}>
          <SectionTitle>영역별 학습 진도</SectionTitle>
          {progress.map(([label,val])=>(<div key={label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}><span style={{fontSize:12,color:"#888780",width:90,flexShrink:0}}>{label}</span><div style={{flex:1,background:"#F1EFE8",borderRadius:99,height:6,overflow:"hidden"}}><div style={{width:val+"%",height:"100%",background:progColor(val),borderRadius:99}}/></div><span style={{fontSize:11,fontWeight:500,color:progColor(val),width:32,textAlign:"right"}}>{val}%</span></div>))}
          <SectionTitle style={{marginTop:16}}>출석 현황</SectionTitle>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{attArr.map((v,i)=><div key={i} style={{width:20,height:20,borderRadius:"50%",background:v?"#EAF3DE":"#FCEBEB",color:v?"#27500A":"#791F1F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:500}}>{v?"O":"X"}</div>)}</div>
        </Card>
      </div>
    </div>
  );
}

function Attendance({attendanceData,setAttendanceData}){
  const today=new Date();
  const todayStr=`${today.getFullYear()}년 ${today.getMonth()+1}월 ${today.getDate()}일 (${"일월화수목금토"[today.getDay()]}요일)`;
  const todayKey=today.toISOString().split("T")[0];
  const [filterCls,setFilterCls]=useState("all");
  const [search,setSearch]=useState("");
  const [successMsg,setSuccessMsg]=useState("");
  const clsColor={A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"};

  // 오늘 출석 데이터를 att 형태로 변환
  const att = {};
  STUDENTS.forEach(s=>{
    const todayRec=(attendanceData[s.id]||[]).find(r=>r.date===todayKey);
    if(todayRec) att[s.id]=todayRec.status;
  });

  const filtered=STUDENTS.filter(s=>(filterCls==="all"||s.cls===filterCls)&&(!search||s.name.includes(search)));
  const [localAtt,setLocalAtt]=useState(att);
  const setOne=(id,val)=>setLocalAtt(prev=>{const n={...prev};if(n[id]===val)delete n[id];else n[id]=val;return n;});
  const bulkSet=(val)=>{const n={...localAtt};filtered.forEach(s=>{if(val===null)delete n[s.id];else n[s.id]=val;});setLocalAtt(n);};
  const oCount=filtered.filter(s=>localAtt[s.id]==="O").length;
  const xCount=filtered.filter(s=>localAtt[s.id]==="X").length;
  const lCount=filtered.filter(s=>localAtt[s.id]==="L").length;
  const nCount=filtered.filter(s=>!localAtt[s.id]).length;

  const save=async()=>{
    const missing=filtered.filter(s=>!localAtt[s.id]);
    if(missing.length>0){const ok=window.confirm(`${missing.map(s=>s.name).join(", ")} — ${missing.length}명 미입력입니다. 저장할까요?`);if(!ok)return;}
    const records=filtered.filter(s=>localAtt[s.id]).map(s=>({
      student_id:s.id, student_name:s.name, cls:s.cls,
      date:todayKey, status:localAtt[s.id],
    }));
    if(records.length>0){
      const {error}=await supabase.from("attendance").upsert(records,{onConflict:"student_id,date"});
      if(error){alert("저장 중 오류가 발생했습니다.");console.error(error);return;}
      const newData={...attendanceData};
      records.forEach(r=>{
        if(!newData[r.student_id]) newData[r.student_id]=[];
        const idx=newData[r.student_id].findIndex(x=>x.date===todayKey);
        if(idx>=0) newData[r.student_id][idx]=r;
        else newData[r.student_id]=[r,...newData[r.student_id]];
      });
      setAttendanceData(newData);
      // 월 개근 자동 체크 (출석 O인 학생만)
      const presentStudents=records.filter(r=>r.status==="O");
      for(const r of presentStudents){
        const stu=STUDENTS.find(s=>s.id===r.student_id);
        if(stu) await checkMonthlyAttendance(stu.id, stu.name, stu.cls);
      }
    }
    setSuccessMsg(`${todayStr} 저장 완료 — 출석 ${oCount}명 / 결석 ${xCount}명 / 지각 ${lCount}명`);
    setTimeout(()=>setSuccessMsg(""),4000);
  };
  const attBtn=(sid,type)=>{const active=localAtt[sid]===type;const col={O:{bg:"#EAF3DE",c:"#27500A",b:"#97C459"},X:{bg:"#FCEBEB",c:"#791F1F",b:"#F09595"},L:{bg:"#FAEEDA",c:"#633806",b:"#EF9F27"},E:{bg:"#E6F1FB",c:"#0C447C",b:"#85B7EB"}}[type];return{width:34,height:28,borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:500,border:`0.5px solid ${active?col.b:"#D3D1C7"}`,background:active?col.bg:"transparent",color:active?col.c:"#888780"};};
  return(
    <div>
      <div style={{fontSize:13,color:"#888780",marginBottom:16}}>{todayStr}</div>
      <SuccessBox msg={successMsg}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
        <KpiCard label="출석" value={oCount} sub={filtered.length?Math.round(oCount/filtered.length*100)+"%":"—"} valueColor="#27500A"/>
        <KpiCard label="결석" value={xCount} sub={filtered.length?Math.round(xCount/filtered.length*100)+"%":"—"} valueColor="#E24B4A"/>
        <KpiCard label="지각" value={lCount} sub={filtered.length?Math.round(lCount/filtered.length*100)+"%":"—"} valueColor="#BA7517"/>
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
          <thead><tr style={{background:"#F1EFE8"}}>{["#","이름","반","출결 선택","현황","이번 달"].map((h,i)=><th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map((s,i)=>(
              <tr key={s.id} style={{borderBottom:"0.5px solid #D3D1C7"}} onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{i+1}</td>
                <td style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={s.name} idx={s.id} size={26}/><span>{s.name}</span></div></td>
                <td style={{padding:"8px 12px"}}><Badge label={clsLabel(s.cls)} type={clsColor[s.cls]}/></td>
                <td style={{padding:"8px 12px"}}><div style={{display:"flex",gap:4}}>{[["O","출"],["X","결"],["L","지"],["E","공"]].map(([val,label])=><button key={val} onClick={()=>setOne(s.id,val)} style={attBtn(s.id,val)}>{label}</button>)}</div></td>
                <td style={{padding:"8px 12px"}}>{localAtt[s.id]==="O"&&<Badge label="출석" type="green"/>}{localAtt[s.id]==="X"&&<Badge label="결석" type="red"/>}{localAtt[s.id]==="L"&&<Badge label="지각" type="amber"/>}{localAtt[s.id]==="E"&&<Badge label="공결" type="blue"/>}{!localAtt[s.id]&&<Badge label="미입력" type="gray"/>}</td>
                <td style={{padding:"8px 12px"}}><div style={{display:"flex",gap:2,flexWrap:"wrap"}}>{(attendanceData[s.id]||[]).slice(0,12).map((r,j)=><div key={j} style={{width:10,height:10,borderRadius:"50%",background:r.status==="O"?"#97C459":r.status==="L"?"#EF9F27":"#F09595"}}/>)}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
        <BtnSecondary onClick={()=>{const n={};STUDENTS.forEach(s=>delete n[s.id]);setLocalAtt({});}}>초기화</BtnSecondary>
        <BtnPrimary onClick={save}>저장 완료</BtnPrimary>
      </div>
    </div>
  );
}

function ScoreEntry({scoresData,setScoresData}){
  const [mainTab,setMainTab] = useState("word"); // word|mock|school
  const [successMsg,setSuccessMsg] = useState("");

  return(
    <div>
      <SuccessBox msg={successMsg}/>
      {/* 메인 탭 */}
      <div style={{display:"flex",gap:4,marginBottom:16}}>
        {[["word","📝 단어시험"],["mock","📄 모의고사"],["school","🏫 내신"]].map(([id,label])=>(
          <button key={id} onClick={()=>setMainTab(id)}
            style={{fontSize:12,padding:"6px 14px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:mainTab===id?"#185FA5":"#D3D1C7",background:mainTab===id?"#E6F1FB":"transparent",color:mainTab===id?"#185FA5":"#888780",fontWeight:mainTab===id?500:400}}>
            {label}
          </button>
        ))}
      </div>
      {mainTab==="word"&&<WordScoreEntry scoresData={scoresData} setScoresData={setScoresData}/>}
      {mainTab==="mock"&&<ExamScoreEntry examType="mock" successMsg={successMsg} setSuccessMsg={setSuccessMsg}/>}
      {mainTab==="school"&&<ExamScoreEntry examType="school" successMsg={successMsg} setSuccessMsg={setSuccessMsg}/>}
    </div>
  );
}

// ── 단어시험 입력 (기존 로직 유지) ──────────────────
function WordScoreEntry({scoresData,setScoresData}){
  const today = new Date();
  const defaultWeek = `${today.getFullYear()}년 ${today.getMonth()+1}월 ${Math.ceil(today.getDate()/7)}주차`;
  const [filterCls,setFilterCls] = useState("all");
  const [scores,setScores]       = useState({});
  const [maxScore,setMaxScore]   = useState(100);
  const [week,setWeek]           = useState(defaultWeek);
  const [testDate,setTestDate]   = useState(today.toISOString().split("T")[0]);
  const [savedSession,setSavedSession] = useState(false);
  const [successMsg,setSuccessMsg]     = useState("");
  const [historyTab,setHistoryTab]     = useState(false);
  const [selWeek,setSelWeek]     = useState(null);
  const [selDate,setSelDate]     = useState(null);
  const [statsModal,setStatsModal] = useState(null);

  const clsColor = {A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"};
  const filtered = STUDENTS.filter(s=>filterCls==="all"||s.cls===filterCls);
  const passLine = Math.round(maxScore*0.7);
  const setScore=(id,val)=>{const n={...scores};if(val===""||isNaN(val))delete n[id];else n[id]=Math.min(Math.max(0,parseInt(val)),maxScore);setScores(n);setSavedSession(false);};
  const filled    = filtered.filter(s=>scores[s.id]!==undefined).length;
  const avg       = filled>0?Math.round(filtered.filter(s=>scores[s.id]!==undefined).reduce((a,s)=>a+scores[s.id],0)/filled):null;
  const passCount = filtered.filter(s=>scores[s.id]!==undefined&&scores[s.id]>=passLine).length;
  const inputStyle= v=>{if(v===undefined)return{};const p=v/maxScore*100;return p>=80?{background:"#EAF3DE",color:"#27500A",borderColor:"#97C459"}:p>=65?{background:"#FAEEDA",color:"#633806",borderColor:"#EF9F27"}:{background:"#FCEBEB",color:"#791F1F",borderColor:"#F09595"};};
  const allRecords=Object.values(scoresData).flat();
  const weekGroups={};
  allRecords.forEach(r=>{if(!weekGroups[r.week])weekGroups[r.week]={};const d=r.test_date||r.created_at?.split("T")[0]||"날짜없음";if(!weekGroups[r.week][d])weekGroups[r.week][d]=[];weekGroups[r.week][d].push(r);});
  const weekList=Object.keys(weekGroups).sort().reverse();
  const dateList=selWeek?Object.keys(weekGroups[selWeek]).sort().reverse():[];
  const selRecords=(selWeek&&selDate)?(weekGroups[selWeek][selDate]||[]):[];
  const selAvg=selRecords.length>0?Math.round(selRecords.reduce((a,b)=>a+b.score,0)/selRecords.length):0;
  const selPass=selRecords.filter(r=>r.pass).length;

  const save=async()=>{
    if(filled===0){alert("입력된 점수가 없습니다.");return;}
    const records=filtered.filter(s=>scores[s.id]!==undefined).map(s=>({
      student_id:s.id,student_name:s.name,cls:s.cls,
      score:scores[s.id],max_score:maxScore,week,pass:scores[s.id]>=passLine,test_date:testDate,
    }));
    const {data:saved,error}=await supabase.from("scores").insert(records).select();
    if(error){alert("저장 중 오류가 발생했습니다.");return;}
    const newData={...scoresData};
    (saved||[]).forEach(r=>{if(!newData[r.student_id])newData[r.student_id]=[];newData[r.student_id]=[r,...newData[r.student_id]];});
    setScoresData(newData);
    setSavedSession(true);
    setSelWeek(week);setSelDate(testDate);
    // 합격 학생 자동 포인트 지급
    const passRecs=(saved||[]).filter(r=>r.pass);
    if(passRecs.length>0){
      await supabase.from("points").insert(passRecs.map(r=>({
        student_id:r.student_id, student_name:r.student_name, cls:r.cls,
        amount:100, reason:"단어시험 합격", category:"시험",
      })));
      // XP 적립
      for(const r of passRecs) await addXp(r.student_id, 100);
    }
    setSuccessMsg(`"${week}" (${testDate}) 저장 완료 — ${filled}명, 평균 ${avg}점${passRecs.length>0?` · ${passRecs.length}명 100p 자동 지급!`:""}`);
    setTimeout(()=>setSuccessMsg(""),4000);
  };

  return(
    <div>
      {statsModal&&<ExamStatsModal keyData={statsModal.keyData} allScores={statsModal.allScores} isWordTest={statsModal.isWordTest||false} onClose={()=>setStatsModal(null)}/>}
      <SuccessBox msg={successMsg}/>
      <div style={{display:"flex",gap:4,marginBottom:16}}>
        {[["input","점수 입력"],["history",`이전 기록 (${weekList.length}주차)`]].map(([id,label])=>(
          <button key={id} onClick={()=>setHistoryTab(id==="history")} style={{fontSize:12,padding:"5px 14px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:(id==="history")===historyTab?"#888780":"#D3D1C7",background:(id==="history")===historyTab?"#F1EFE8":"transparent",color:(id==="history")===historyTab?"#2C2C2A":"#888780",fontWeight:(id==="history")===historyTab?500:400}}>{label}</button>
        ))}
      </div>
      {!historyTab&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
            <KpiCard label="입력 완료" value={`${filled}/${filtered.length}`} sub="명"/>
            <KpiCard label="평균 점수" value={avg!==null?avg+"점":"—"} sub="입력된 학생"/>
            <KpiCard label="합격" value={passCount+"명"} sub={`합격선 ${passLine}점`} valueColor="#27500A"/>
            <KpiCard label="불합격" value={filled>0?filled-passCount+"명":"—"} sub="" valueColor="#E24B4A"/>
          </div>
          <div style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:10,padding:"12px 14px",marginBottom:12,display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,color:"#888780",flexShrink:0}}>📅 시험 날짜:</span>
              <input type="date" value={testDate} onChange={e=>setTestDate(e.target.value)} style={{fontSize:13,padding:"4px 8px",borderRadius:6,border:"0.5px solid #D3D1C7",color:"#2C2C2A"}}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,color:"#888780",flexShrink:0}}>📝 주차명:</span>
              <input value={week} onChange={e=>setWeek(e.target.value)} style={{fontSize:12,padding:"4px 8px",borderRadius:6,border:"0.5px solid #D3D1C7",width:150,color:"#2C2C2A"}}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,color:"#888780",flexShrink:0}}>만점:</span>
              <input type="number" value={maxScore} onChange={e=>setMaxScore(parseInt(e.target.value)||100)} style={{width:56,fontSize:13,padding:"4px 8px",borderRadius:6,border:"0.5px solid #D3D1C7"}}/>
            </div>
            <div style={{display:"flex",gap:6,marginLeft:"auto"}}>
              <button onClick={()=>{const n={};filtered.forEach(s=>{if(scores[s.id]===undefined)n[s.id]=maxScore;});setScores({...scores,...n});}} style={{fontSize:12,padding:"5px 10px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>빈 칸 채우기</button>
              <button onClick={()=>{setScores({});setSavedSession(false);}} style={{fontSize:12,padding:"5px 10px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>초기화</button>
            </div>
          </div>
          {savedSession&&<div style={{background:"#E6F1FB",border:"0.5px solid #85B7EB",borderRadius:8,padding:"8px 14px",fontSize:12,color:"#0C447C",marginBottom:12}}>💾 저장됐어요! "새 시험 입력" 버튼으로 다음 시험을 입력하세요.</div>}
          <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden",marginBottom:16}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"#F1EFE8"}}>{["#","이름","반","점수 입력","합격 여부","직전 점수","변화"].map((h,i)=><th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map((s,i)=>{
                  const v=scores[s.id];const prevScore=(scoresData[s.id]||[])[0]?.score;const diff=v!==undefined&&prevScore!==undefined?v-prevScore:null;
                  return(<tr key={s.id} style={{borderBottom:"0.5px solid #D3D1C7"}} onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{i+1}</td>
                    <td style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={s.name} idx={s.id} size={26}/><span>{s.name}</span></div></td>
                    <td style={{padding:"8px 12px"}}><Badge label={clsLabel(s.cls)} type={clsColor[s.cls]}/></td>
                    <td style={{padding:"8px 12px"}}><input type="number" min="0" max={maxScore} value={v??""} placeholder="—" onChange={e=>setScore(s.id,e.target.value)} disabled={savedSession} style={{width:64,textAlign:"center",fontSize:13,padding:"4px 6px",borderRadius:6,border:"0.5px solid #D3D1C7",...inputStyle(v)}}/></td>
                    <td style={{padding:"8px 12px"}}>{v!==undefined?<Badge label={v>=passLine?"합격":"불합격"} type={v>=passLine?"green":"red"}/>:<Badge label="—" type="gray"/>}</td>
                    <td style={{padding:"8px 12px",color:"#888780"}}>{prevScore!==undefined?prevScore+"점":"—"}</td>
                    <td style={{padding:"8px 12px"}}>{diff!==null?(diff>0?<span style={{color:"#27500A",fontSize:12}}>▲{diff}</span>:diff<0?<span style={{color:"#E24B4A",fontSize:12}}>▼{Math.abs(diff)}</span>:<span style={{color:"#888780",fontSize:12}}>—</span>):<span style={{color:"#888780",fontSize:12}}>—</span>}</td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <BtnSecondary onClick={()=>{setScores({});setSavedSession(false);}}>초기화</BtnSecondary>
            {!savedSession&&<BtnPrimary onClick={save}>저장 완료</BtnPrimary>}
            {savedSession&&<BtnPrimary onClick={()=>{setScores({});setSavedSession(false);const d=new Date();setWeek(`${d.getFullYear()}년 ${d.getMonth()+1}월 ${Math.ceil(d.getDate()/7)}주차`);setTestDate(d.toISOString().split("T")[0]);}}>새 시험 입력</BtnPrimary>}
          </div>
        </>
      )}
      {historyTab&&(
        <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:16}}>
          <div>
            <div style={{fontSize:12,fontWeight:500,color:"#888780",marginBottom:8}}>주차 선택</div>
            {weekList.length===0?<div style={{fontSize:13,color:"#888780"}}>기록 없음</div>:weekList.map(w=>{
              const allRecs=Object.values(weekGroups[w]).flat();
              const wAvg=allRecs.length>0?Math.round(allRecs.reduce((a,b)=>a+b.score,0)/allRecs.length):0;
              const isSelected=selWeek===w;
              return(<div key={w} onClick={()=>{setSelWeek(w);setSelDate(null);}} style={{padding:"10px 12px",borderRadius:8,marginBottom:6,cursor:"pointer",border:`0.5px solid ${isSelected?"#185FA5":"#D3D1C7"}`,background:isSelected?"#E6F1FB":"white"}}>
                <div style={{fontSize:13,fontWeight:500,color:isSelected?"#185FA5":"#2C2C2A",marginBottom:3}}>{w}</div>
                <div style={{fontSize:11,color:"#888780"}}>📅 {Object.keys(weekGroups[w]).length}회 시험 · 평균 <b>{wAvg}점</b></div>
              </div>);
            })}
          </div>
          <div>
            {!selWeek?<div style={{textAlign:"center",padding:"4rem 0",color:"#888780",fontSize:13}}>왼쪽에서 주차를 선택해주세요</div>:(
              <>
                <div style={{fontSize:12,fontWeight:500,color:"#888780",marginBottom:8}}>{selWeek} — 날짜 선택</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                  {dateList.map(d=>{
                    const recs=weekGroups[selWeek][d];
                    const dAvg=Math.round(recs.reduce((a,b)=>a+b.score,0)/recs.length);
                    const isSelected=selDate===d;
                    return(<button key={d} onClick={()=>setSelDate(d)} style={{padding:"6px 12px",borderRadius:8,cursor:"pointer",border:`0.5px solid ${isSelected?"#185FA5":"#D3D1C7"}`,background:isSelected?"#E6F1FB":"white",textAlign:"left"}}>
                      <div style={{fontSize:12,fontWeight:500,color:isSelected?"#185FA5":"#2C2C2A"}}>{d}</div>
                      <div style={{fontSize:10,color:"#888780"}}>평균 {dAvg}점 · {recs.length}명</div>
                    </button>);
                  })}
                </div>
                {selDate&&(
                  <>
                    <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
                      <div style={{background:"#EAF3DE",borderRadius:8,padding:"6px 12px",fontSize:12,color:"#27500A",fontWeight:500}}>합격 {selPass}명</div>
                      <div style={{background:"#FCEBEB",borderRadius:8,padding:"6px 12px",fontSize:12,color:"#791F1F",fontWeight:500}}>불합격 {selRecords.length-selPass}명</div>
                      <div style={{background:"#E6F1FB",borderRadius:8,padding:"6px 12px",fontSize:12,color:"#0C447C",fontWeight:500}}>평균 {selAvg}점</div>
                      <div style={{background:"#F1EFE8",borderRadius:8,padding:"6px 12px",fontSize:12,color:"#888780"}}>총 {selRecords.length}명</div>
                      <button onClick={()=>setStatsModal({keyData:{title:selWeek,test_date:selDate},allScores:selRecords,isWordTest:true})} style={{fontSize:12,padding:"6px 12px",borderRadius:8,border:"0.5px solid #185FA5",background:"#E6F1FB",color:"#0C447C",cursor:"pointer",fontWeight:500,marginLeft:"auto"}}>📊 통계 보기</button>
                    </div>
                    <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                        <thead><tr style={{background:"#F1EFE8"}}>{["등수","이름","반","점수","합격 여부"].map((h,i)=><th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}</tr></thead>
                        <tbody>
                          {[...selRecords].sort((a,b)=>b.score-a.score).map((r,i)=>{
                            const col=r.score/r.max_score*100>=80?"#639922":r.score/r.max_score*100>=65?"#BA7517":"#E24B4A";
                            return(<tr key={r.id} style={{borderBottom:"0.5px solid #D3D1C7"}} onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                              <td style={{padding:"8px 12px",fontWeight:500,color:i<3?"#BA7517":"#888780"}}>{i+1}</td>
                              <td style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:26,height:26,borderRadius:"50%",background:AVATAR_COLORS[r.student_id%AVATAR_COLORS.length].bg,color:AVATAR_COLORS[r.student_id%AVATAR_COLORS.length].c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:500,flexShrink:0}}>{r.student_name?.slice(0,2)}</div><span>{r.student_name}</span></div></td>
                              <td style={{padding:"8px 12px"}}><Badge label={clsLabel(r.cls)} type={{A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"}[r.cls]||"gray"}/></td>
                              <td style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:70,height:5,background:"#F1EFE8",borderRadius:99,overflow:"hidden"}}><div style={{width:(r.score/r.max_score*100)+"%",height:"100%",background:col,borderRadius:99}}/></div><span style={{fontWeight:500,color:col}}>{r.score}점</span></div></td>
                              <td style={{padding:"8px 12px"}}><Badge label={r.pass?"합격":"불합격"} type={r.pass?"green":"red"}/></td>
                            </tr>);
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 모의고사/내신 점수 입력 ──────────────────────────
function ExamScoreEntry({examType}){
  const [filterCls,setFilterCls] = useState("all");
  const [examName,setExamName]   = useState("");
  const [examDate,setExamDate]   = useState(new Date().toISOString().split("T")[0]);
  const [subject,setSubject]     = useState("영어");
  const [maxScore,setMaxScore]   = useState(100);
  const [scores,setScores]       = useState({});
  const [grades,setGrades]       = useState({});
  const [savedSession,setSavedSession] = useState(false);
  const [successMsg,setSuccessMsg]     = useState("");
  const [historyData,setHistoryData]   = useState([]);
  const [viewTab,setViewTab]     = useState("input");
  const [selExam,setSelExam]     = useState(null);
  const [statsModal,setStatsModal] = useState(null);

  const typeLabel = examType==="mock"?"모의고사":"내신";
  const filtered  = STUDENTS.filter(s=>filterCls==="all"||s.cls===filterCls);
  const filled    = filtered.filter(s=>scores[s.id]!==undefined).length;
  const avg       = filled>0?Math.round(filtered.filter(s=>scores[s.id]!==undefined).reduce((a,s)=>a+scores[s.id],0)/filled):null;

  // ── 등급 자동 계산 ──
  const calcMockGrade=(score,max=100)=>{
    const pct=score/max*100;
    if(pct>=90) return "1등급";
    if(pct>=80) return "2등급";
    if(pct>=70) return "3등급";
    if(pct>=60) return "4등급";
    if(pct>=50) return "5등급";
    if(pct>=40) return "6등급";
    if(pct>=30) return "7등급";
    if(pct>=20) return "8등급";
    return "9등급";
  };

  // 내신/과제: 전체 점수 배열 기준 누적 비율로 등급 산출
  // 1등급 상위 10%, 2등급 ~34%, 3등급 ~66%, 4등급 ~90%, 5등급 ~100%
  const calcRelativeGrade=(score,allScores)=>{
    if(!allScores||allScores.length===0) return "";
    const sorted=[...allScores].sort((a,b)=>b-a);
    const rank=sorted.findIndex(s=>s<=score)+1; // 내 점수 이하 중 가장 높은 등수
    // 실제로는 내 점수보다 높은 사람 수 기준
    const above=sorted.filter(s=>s>score).length;
    const pct=(above/sorted.length)*100;
    if(pct<10)  return "1등급";
    if(pct<34)  return "2등급";
    if(pct<66)  return "3등급";
    if(pct<90)  return "4등급";
    return "5등급";
  };

  // 점수 입력 시 등급 자동 계산
  const handleScoreChange=(studentId,val)=>{
    const n=parseInt(val);
    setScores(prev=>({...prev,[studentId]:isNaN(n)?undefined:Math.min(Math.max(0,n),maxScore)}));
    setSavedSession(false);
    // 모의고사는 즉시 계산
    if(examType==="mock"&&!isNaN(n)){
      setGrades(prev=>({...prev,[studentId]:calcMockGrade(n,maxScore)}));
    }
  };

  // 내신/과제: 모든 점수 입력값 기준으로 등급 일괄 재계산
  const recalcRelativeGrades=(newScores)=>{
    if(examType==="mock") return;
    const allVals=Object.values(newScores).filter(v=>v!==undefined);
    if(allVals.length===0) return;
    const newGrades={};
    Object.entries(newScores).forEach(([id,score])=>{
      if(score!==undefined) newGrades[id]=calcRelativeGrade(score,allVals);
    });
    setGrades(newGrades);
  };

  // scores 변경될 때마다 내신/과제 등급 재계산
  useEffect(()=>{
    if(examType!=="mock") recalcRelativeGrades(scores);
  },[scores]);

  const loadHistory=async()=>{
    const {data}=await supabase.from("exam_scores").select("*").eq("exam_type",examType).order("exam_date",{ascending:false});
    setHistoryData(data||[]);
  };
  useEffect(()=>{loadHistory();},[examType]);

  const examGroups={};
  historyData.forEach(r=>{
    const key=`${r.exam_name}__${r.exam_date}`;
    if(!examGroups[key]) examGroups[key]={exam_name:r.exam_name,exam_date:r.exam_date,subject:r.subject,records:[]};
    examGroups[key].records.push(r);
  });
  const examList=Object.entries(examGroups).sort((a,b)=>b[1].exam_date?.localeCompare(a[1].exam_date));

  const save=async()=>{
    if(!examName.trim()){alert("시험명을 입력해주세요.");return;}
    if(filled===0){alert("입력된 점수가 없습니다.");return;}
    const records=filtered.filter(s=>scores[s.id]!==undefined).map(s=>({
      student_id:s.id,student_name:s.name,cls:s.cls,
      exam_type:examType,exam_name:examName,exam_date:examDate,
      subject,score:scores[s.id],max_score:maxScore,
      grade:grades[s.id]||"",note:"",
    }));
    const {error}=await supabase.from("exam_scores").insert(records);
    if(error){alert("저장 중 오류가 발생했습니다.");return;}
    await loadHistory();
    // 등급별 자동 포인트 지급 (모의고사 1·2등급, 내신 1등급만)
    const gradePointMap={
      "1등급":{mock:"mock_1", school:"school_1"},
      "2등급":{mock:"mock_2", school:null},        // 내신 2등급은 포인트 없음
    };
    const pointRows=records
      .filter(r=>r.grade&&gradePointMap[r.grade])
      .map(r=>{
        const ruleId=gradePointMap[r.grade]?.[examType];
        if(!ruleId) return null;
        const rule=POINT_RULES.find(x=>x.id===ruleId);
        if(!rule) return null;
        return{student_id:r.student_id,student_name:r.student_name,cls:r.cls,amount:rule.amount,reason:rule.label,category:"시험"};
      }).filter(Boolean);
    if(pointRows.length>0){
      await supabase.from("points").insert(pointRows);
      // XP 적립
      for(const r of pointRows) await addXp(r.student_id, r.amount);
    }
    setSavedSession(true);
    setSuccessMsg(`"${examName}" ${typeLabel} 저장 완료 — ${filled}명, 평균 ${avg}점${pointRows.length>0?` · ${pointRows.length}명 포인트 자동 지급!`:""} → 학습리포트에 자동 반영됩니다!`);
    setTimeout(()=>setSuccessMsg(""),5000);
  };

  const deleteExam=async(name,date)=>{
    if(!window.confirm(`"${name}" 기록을 삭제할까요?`))return;
    await supabase.from("exam_scores").delete().eq("exam_type",examType).eq("exam_name",name).eq("exam_date",date);
    await loadHistory();
    setSelExam(null);
  };

  const openStats=(key)=>{
    const g=examGroups[key];
    if(!g)return;
    setStatsModal({
      keyData:{title:g.exam_name,test_date:g.exam_date,q_count:g.records[0]?.max_score||100},
      allScores:g.records.map(r=>({
        id:r.id,student_id:r.student_id,student_name:r.student_name,
        cls:r.cls,score:r.score,pass:r.score/(r.max_score||100)>=0.7,
        max_score:r.max_score||100,
      })),
    });
  };

  const selGroup=selExam?examGroups[selExam]:null;

  return(
    <div>
      {statsModal&&<ExamStatsModal keyData={statsModal.keyData} allScores={statsModal.allScores} onClose={()=>setStatsModal(null)}/>}
      <SuccessBox msg={successMsg}/>
      <div style={{display:"flex",gap:4,marginBottom:16}}>
        {[["input","점수 입력"],["history",`이전 기록 (${examList.length}회)`]].map(([id,label])=>(
          <button key={id} onClick={()=>setViewTab(id)} style={{fontSize:12,padding:"5px 14px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:viewTab===id?"#888780":"#D3D1C7",background:viewTab===id?"#F1EFE8":"transparent",color:viewTab===id?"#2C2C2A":"#888780",fontWeight:viewTab===id?500:400}}>{label}</button>
        ))}
      </div>

      {viewTab==="input"&&(
        <>
          <div style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:10,padding:"12px 14px",marginBottom:12,display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:200}}>
              <span style={{fontSize:12,color:"#888780",flexShrink:0}}>📋 시험명 *</span>
              <input value={examName} onChange={e=>setExamName(e.target.value)} placeholder={examType==="mock"?"예: 2026년 3월 모의고사":"예: 1학기 중간고사"}
                style={{flex:1,fontSize:13,padding:"4px 8px",borderRadius:6,border:"0.5px solid #D3D1C7",color:"#2C2C2A"}}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,color:"#888780",flexShrink:0}}>📅 날짜</span>
              <input type="date" value={examDate} onChange={e=>setExamDate(e.target.value)} style={{fontSize:13,padding:"4px 8px",borderRadius:6,border:"0.5px solid #D3D1C7",color:"#2C2C2A"}}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,color:"#888780",flexShrink:0}}>과목</span>
              <select value={subject} onChange={e=>setSubject(e.target.value)} style={{fontSize:13,padding:"4px 8px",borderRadius:6,border:"0.5px solid #D3D1C7"}}>
                {["영어","국어","수학","사회","과학","기타"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,color:"#888780",flexShrink:0}}>만점</span>
              <input type="number" value={maxScore} onChange={e=>setMaxScore(parseInt(e.target.value)||100)} style={{width:56,fontSize:13,padding:"4px 8px",borderRadius:6,border:"0.5px solid #D3D1C7"}}/>
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
            <ClassFilter value={filterCls} onChange={setFilterCls}/>
            <button onClick={()=>{const n={};filtered.forEach(s=>n[s.id]=maxScore);setScores({...scores,...n});}} style={{fontSize:12,padding:"5px 10px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>빈 칸 채우기</button>
            <button onClick={()=>{setScores({});setGrades({});setSavedSession(false);}} style={{fontSize:12,padding:"5px 10px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>초기화</button>
          </div>
          {savedSession&&<div style={{background:"#E6F1FB",border:"0.5px solid #85B7EB",borderRadius:8,padding:"8px 14px",fontSize:12,color:"#0C447C",marginBottom:12}}>
            💾 저장됐어요! 학습리포트 → {typeLabel} 탭에서 확인하세요.
          </div>}
          <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden",marginBottom:12}}>
            {/* 등급 기준 안내 */}
            <div style={{background:"#F1EFE8",borderTop:"none",padding:"8px 14px",fontSize:11,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>
              {examType==="mock"?(
                <span>📊 <b>모의고사 등급 기준</b>: 90↑ 1등급 · 80↑ 2등급 · 70↑ 3등급 · 60↑ 4등급 · 50↑ 5등급 · 40↑ 6등급 · 30↑ 7등급 · 20↑ 8등급 · 미만 9등급 (점수 입력 시 자동 계산)</span>
              ):(
                <span>📊 <b>내신 등급 기준</b>: 상위 10% 1등급 · 34% 2등급 · 66% 3등급 · 90% 4등급 · 100% 5등급 (전체 입력 점수 기준 자동 계산)</span>
              )}
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"#F1EFE8"}}>{["#","이름","반","점수","등급 (자동)","직전 점수"].map((h,i)=><th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map((s,i)=>{
                  const v=scores[s.id];
                  const prev=historyData.filter(r=>r.student_id===s.id)[0]?.score;
                  const col=v!==undefined?(v/maxScore>=0.8?"#27500A":v/maxScore>=0.65?"#BA7517":"#E24B4A"):"#888780";
                  const autoGrade=grades[s.id]||"";
                  const gradeColor=autoGrade==="1등급"?"#0C447C":autoGrade==="2등급"?"#27500A":autoGrade==="3등급"?"#27500A":autoGrade==="4등급"?"#633806":autoGrade==="5등급"?"#BA7517":"#E24B4A";
                  const gradeBg=autoGrade==="1등급"?"#E6F1FB":autoGrade==="2등급"||autoGrade==="3등급"?"#EAF3DE":autoGrade==="4등급"||autoGrade==="5등급"?"#FAEEDA":"#FCEBEB";
                  return(<tr key={s.id} style={{borderBottom:"0.5px solid #D3D1C7"}} onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{i+1}</td>
                    <td style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={s.name} idx={s.id} size={26}/><span>{s.name}</span></div></td>
                    <td style={{padding:"8px 12px"}}><Badge label={clsLabel(s.cls)} type={{A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"}[s.cls]||"gray"}/></td>
                    <td style={{padding:"8px 12px"}}>
                      <input type="number" min="0" max={maxScore} value={v??""} placeholder="—"
                        onChange={e=>handleScoreChange(s.id,e.target.value)}
                        disabled={savedSession}
                        style={{width:64,textAlign:"center",fontSize:13,padding:"4px 6px",borderRadius:6,border:"0.5px solid #D3D1C7",color:col,background:v!==undefined?(v/maxScore>=0.8?"#EAF3DE":v/maxScore>=0.65?"#FAEEDA":"#FCEBEB"):"white"}}/>
                    </td>
                    <td style={{padding:"8px 12px"}}>
                      {autoGrade?(
                        <span style={{fontSize:12,padding:"3px 10px",borderRadius:99,background:gradeBg,color:gradeColor,fontWeight:500}}>
                          {autoGrade}
                        </span>
                      ):(
                        <span style={{fontSize:12,color:"#888780"}}>—</span>
                      )}
                      {examType!=="mock"&&v!==undefined&&(
                        <div style={{fontSize:10,color:"#888780",marginTop:2}}>자동계산</div>
                      )}
                    </td>
                    <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{prev!==undefined?prev+"점":"—"}</td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <div style={{fontSize:12,color:"#888780"}}>💡 저장하면 학습리포트 → {typeLabel} 추이에 자동 반영돼요</div>
            <div style={{display:"flex",gap:8}}>
              <BtnSecondary onClick={()=>{setScores({});setGrades({});setSavedSession(false);}}>초기화</BtnSecondary>
              {!savedSession&&<BtnPrimary onClick={save}>저장 완료</BtnPrimary>}
              {savedSession&&<BtnPrimary onClick={()=>{setScores({});setGrades({});setSavedSession(false);setExamName("");setExamDate(new Date().toISOString().split("T")[0]);}}>새 시험 입력</BtnPrimary>}
            </div>
          </div>
        </>
      )}

      {viewTab==="history"&&(
        <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:16}}>
          <div>
            <div style={{fontSize:12,fontWeight:500,color:"#888780",marginBottom:8}}>시험 선택</div>
            {examList.length===0?<div style={{fontSize:13,color:"#888780"}}>기록 없음</div>:examList.map(([key,g])=>{
              const avg=Math.round(g.records.reduce((a,b)=>a+b.score,0)/g.records.length);
              const isSelected=selExam===key;
              return(<div key={key} onClick={()=>setSelExam(key)} style={{padding:"10px 12px",borderRadius:8,marginBottom:6,cursor:"pointer",border:`0.5px solid ${isSelected?"#185FA5":"#D3D1C7"}`,background:isSelected?"#E6F1FB":"white"}}>
                <div style={{fontSize:13,fontWeight:500,color:isSelected?"#185FA5":"#2C2C2A",marginBottom:2}}>{g.exam_name}</div>
                <div style={{fontSize:11,color:"#888780"}}>📅 {g.exam_date} · {g.subject}</div>
                <div style={{fontSize:11,color:"#888780"}}>평균 <b>{avg}점</b> · {g.records.length}명</div>
              </div>);
            })}
          </div>
          <div>
            {!selExam?(
              <div style={{textAlign:"center",padding:"4rem 0",color:"#888780",fontSize:13}}>왼쪽에서 시험을 선택해주세요</div>
            ):selGroup&&(
              <>
                {/* 헤더 */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:500,color:"#2C2C2A"}}>{selGroup.exam_name}</div>
                    <div style={{fontSize:12,color:"#888780",marginTop:2}}>📅 {selGroup.exam_date} · {selGroup.subject} · {selGroup.records.length}명</div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>openStats(selExam)}
                      style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"0.5px solid #185FA5",background:"#E6F1FB",color:"#0C447C",cursor:"pointer",fontWeight:500}}>
                      📊 통계 보기
                    </button>
                    <button onClick={()=>deleteExam(selGroup.exam_name,selGroup.exam_date)} style={{fontSize:12,padding:"5px 10px",borderRadius:6,border:"0.5px solid #F09595",background:"#FCEBEB",color:"#791F1F",cursor:"pointer"}}>시험 삭제</button>
                  </div>
                </div>
                {/* 순위표 */}
                <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                    <thead><tr style={{background:"#F1EFE8"}}>{["등수","이름","반","점수","등급"].map((h,i)=><th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}</tr></thead>
                    <tbody>
                      {[...selGroup.records].sort((a,b)=>b.score-a.score).map((r,i)=>{
                        const col=r.score/(r.max_score||100)*100>=80?"#639922":r.score/(r.max_score||100)*100>=65?"#BA7517":"#E24B4A";
                        return(<tr key={r.id} style={{borderBottom:"0.5px solid #D3D1C7"}} onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{padding:"8px 12px",fontWeight:500,color:i<3?"#BA7517":"#888780"}}>{i+1}</td>
                          <td style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:26,height:26,borderRadius:"50%",background:AVATAR_COLORS[r.student_id%AVATAR_COLORS.length].bg,color:AVATAR_COLORS[r.student_id%AVATAR_COLORS.length].c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:500,flexShrink:0}}>{r.student_name?.slice(0,2)}</div><span>{r.student_name}</span></div></td>
                          <td style={{padding:"8px 12px"}}><Badge label={clsLabel(r.cls)} type={{A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"}[r.cls]||"gray"}/></td>
                          <td style={{padding:"8px 12px",fontWeight:500,color:col}}>{r.score}점</td>
                          <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{r.grade||"—"}</td>
                        </tr>);
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Grading(){
  const [tab,setTab]               = useState("list");
  const [answerKeys,setAnswerKeys] = useState([]);
  const [loading,setLoading]       = useState(true);
  const [selKey,setSelKey]         = useState(null);
  const [editForm,setEditForm]     = useState({title:"",week:"",testDate:"",qCount:15,answers:Array(15).fill(0),examType:"과제물",examSubject:"영어"});
  const [studentAns,setStudentAns] = useState({});
  const [studentScores,setStudentScores] = useState({});
  const [selStudent,setSelStudent] = useState(0);
  const [filterCls,setFilterCls]   = useState("all");
  const [successMsg,setSuccessMsg] = useState("");
  const [omrResults,setOmrResults] = useState([]);
  const [omrTab,setOmrTab]         = useState("teacher");
  const [statsModal,setStatsModal] = useState(null);

  const loadKeys=async()=>{
    const {data}=await supabase.from("answer_keys").select("*").order("test_date",{ascending:false});
    setAnswerKeys(data||[]);
    setLoading(false);
  };

  const loadOmrResults=async(keyId)=>{
    const {data}=await supabase.from("omr_results")
      .select("*").eq("answer_key_id",keyId).order("created_at",{ascending:false});
    setOmrResults(data||[]);
  };

  useEffect(()=>{loadKeys();},[]);

  const handleQCount=(n)=>{
    setEditForm(prev=>{
      const a=[...prev.answers];
      while(a.length<n)a.push(0);
      return {...prev,qCount:n,answers:a.slice(0,n)};
    });
  };

  const setAns=(idx,val)=>{
    setEditForm(prev=>{
      const a=[...prev.answers];
      a[idx]=a[idx]===val?0:val;
      return {...prev,answers:a};
    });
  };

  const openNew=()=>{
    const d=new Date();
    setEditForm({
      title:"",
      week:`${d.getFullYear()}년 ${d.getMonth()+1}월 ${Math.ceil(d.getDate()/7)}주차`,
      testDate:d.toISOString().split("T")[0],
      qCount:15,
      answers:Array(15).fill(0),
      targetType:"전체",
      targetCls:[],
      targetStudents:[],
    });
    setSelKey(null);
    setTab("edit");
  };

  const openEdit=(key)=>{
    setEditForm({
      title:key.title||"",
      week:key.week||"",
      testDate:key.test_date||"",
      qCount:key.q_count||15,
      answers:key.answers||Array(key.q_count||15).fill(0),
      targetType:key.target_students&&key.target_students.length>0?"개인별":key.target_cls&&key.target_cls!=="전체"?"반별":"전체",
      targetCls:key.target_cls&&key.target_cls!=="전체"?[key.target_cls]:[],
      targetStudents:key.target_students||[],
      examType:key.exam_type||"과제물",
      examSubject:key.exam_subject||"영어",
    });
    setSelKey(key);
    setTab("edit");
  };

  const saveKey=async()=>{
    if(!editForm.title.trim()){alert("시험 이름을 입력해주세요.");return;}
    if(editForm.answers.some(a=>a===0)){alert("모든 정답을 입력해주세요.");return;}
    const payload={
      title:editForm.title,
      week:editForm.week,
      test_date:editForm.testDate,
      q_count:editForm.qCount,
      answers:editForm.answers,
      target_cls:editForm.targetType==="반별"?editForm.targetCls.join(","):"전체",
      target_students:editForm.targetType==="개인별"?editForm.targetStudents:[],
      exam_type:editForm.examType,
      exam_subject:editForm.examSubject,
    };
    if(selKey){
      // 수정
      const {error}=await supabase.from("answer_keys").update(payload).eq("id",selKey.id);
      if(error){alert("저장 중 오류가 발생했습니다.");return;}
      setSuccessMsg(`"${editForm.title}" 정답지가 수정되었습니다!`);
    } else {
      // 신규
      const {error}=await supabase.from("answer_keys").insert(payload);
      if(error){alert("저장 중 오류가 발생했습니다.");return;}
      setSuccessMsg(`"${editForm.title}" 정답지가 저장되었습니다! 학생이 OMR 탭에서 확인 가능해요.`);
    }
    await loadKeys();
    setTimeout(()=>setSuccessMsg(""),3000);
    setTab("list");
  };

  const deleteKey=async(key)=>{
    if(!window.confirm(`"${key.title||key.week}"을 삭제할까요?`))return;
    await supabase.from("answer_keys").delete().eq("id",key.id);
    await loadKeys();
    setSuccessMsg("삭제되었습니다.");
    setTimeout(()=>setSuccessMsg(""),2000);
  };

  // 채점 관련
  const chunkSize=15;
  const chunks=[];
  const qCount=selKey?.q_count||editForm.qCount;
  for(let i=0;i<qCount;i+=chunkSize)chunks.push([i,Math.min(i+chunkSize,qCount)]);
  const filteredStudents=STUDENTS.filter(s=>filterCls==="all"||s.cls===filterCls);
  const graded=filteredStudents.filter(s=>studentScores[s.id]);
  const scores=graded.map(s=>studentScores[s.id].score);
  const avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0;
  const curAns=studentAns[selStudent]||Array(qCount).fill(0);
  const curScore=studentScores[selStudent];
  const pct=curScore?.score||0;
  const gradeLabel=pct>=90?"A":pct>=80?"B":pct>=70?"C":pct>=60?"D":"F";
  const gradeColor=pct>=90?"#27500A":pct>=80?"#0C447C":pct>=70?"#633806":"#791F1F";
  const gradeBg=pct>=90?"#EAF3DE":pct>=80?"#E6F1FB":pct>=70?"#FAEEDA":"#FCEBEB";
  const barCol=pct>=80?"#639922":pct>=65?"#BA7517":"#E24B4A";
  const markOMR=(qIdx,val)=>{setStudentAns(prev=>{const a=[...(prev[selStudent]||Array(qCount).fill(0))];a[qIdx]=a[qIdx]===val?0:val;return {...prev,[selStudent]:a};});setStudentScores(prev=>{const n={...prev};delete n[selStudent];return n;});};
  const grade=()=>{
    if(!selKey){alert("먼저 정답지를 선택해주세요.");return;}
    const ans=studentAns[selStudent]||[];
    if(ans.every(a=>a===0)){alert("답안을 입력해주세요.");return;}
    const correct=ans.filter((v,i)=>v===selKey.answers[i]).length;
    const sc={correct,total:selKey.q_count,score:Math.round(correct/selKey.q_count*100),wrong:ans.map((v,i)=>v!==selKey.answers[i]?i+1:null).filter(Boolean)};
    setStudentScores(prev=>({...prev,[selStudent]:sc}));
    const s=STUDENTS.find(x=>x.id===selStudent);
    const g=sc.score>=90?"A":sc.score>=80?"B":sc.score>=70?"C":sc.score>=60?"D":"F";
    setSuccessMsg(`${s.name} 채점 완료 — ${sc.score}점 (${g}등급)`);
    setTimeout(()=>setSuccessMsg(""),3000);
  };

  const editChunks=[];
  for(let i=0;i<editForm.qCount;i+=chunkSize)editChunks.push([i,Math.min(i+chunkSize,editForm.qCount)]);

  return(
    <div>
      {statsModal&&<ExamStatsModal keyData={statsModal.keyData} allScores={statsModal.allScores} onClose={()=>setStatsModal(null)}/>}
      <SuccessBox msg={successMsg}/>

      {/* 탭 */}
      <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap"}}>
        {[["list","정답지 목록"],["edit",selKey?"정답지 수정":"정답지 추가"],["student","강사 채점"],["results","전체 결과"],["omr","학생 자가채점"]].map(([id,label])=>(
          <button key={id} onClick={()=>{if(id==="edit"&&!selKey)openNew();else setTab(id);}} style={{fontSize:12,padding:"5px 14px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:tab===id?"#888780":"#D3D1C7",background:tab===id?"#F1EFE8":"transparent",color:tab===id?"#2C2C2A":"#888780",fontWeight:tab===id?500:400}}>{label}</button>
        ))}
      </div>

      {/* ── 정답지 목록 ── */}
      {tab==="list"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
            <BtnPrimary onClick={openNew}>+ 새 정답지 추가</BtnPrimary>
          </div>
          {loading?(
            <div style={{textAlign:"center",padding:"2rem",color:"#888780"}}>불러오는 중...</div>
          ):answerKeys.length===0?(
            <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13}}>
              아직 정답지가 없어요<br/>"새 정답지 추가" 버튼을 눌러 만들어주세요
            </div>
          ):(
            <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:"#F1EFE8"}}>
                  {["시험 이름","주차","시험 날짜","문항 수","공개 대상",""].map((h,i)=><th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {answerKeys.map(k=>(
                    <tr key={k.id} style={{borderBottom:"0.5px solid #D3D1C7"}} onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{padding:"8px 12px",fontWeight:500,color:"#2C2C2A"}}>{k.title||"(제목 없음)"}</td>
                      <td style={{padding:"8px 12px",color:"#888780"}}>{k.week}</td>
                      <td style={{padding:"8px 12px",color:"#888780"}}>{k.test_date}</td>
                      <td style={{padding:"8px 12px"}}><Badge label={k.q_count+"문항"} type="blue"/></td>
                      <td style={{padding:"8px 12px"}}>
                        {k.target_students&&k.target_students.length>0?<Badge label={`개인 ${k.target_students.length}명`} type="purple"/>:k.target_cls&&k.target_cls!=="전체"?<Badge label={k.target_cls+"반"} type="green"/>:<Badge label="전체" type="gray"/>}
                      </td>
                      <td style={{padding:"8px 12px"}}>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>{setSelKey(k);setStudentAns({});setStudentScores({});loadOmrResults(k.id);setTab("student");setOmrTab("teacher");}} style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",cursor:"pointer",color:"#888780"}}>채점</button>
                          <button onClick={()=>openEdit(k)} style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:"0.5px solid #85B7EB",background:"#E6F1FB",cursor:"pointer",color:"#0C447C"}}>수정</button>
                          <button onClick={()=>deleteKey(k)} style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:"0.5px solid #F09595",background:"#FCEBEB",cursor:"pointer",color:"#791F1F"}}>삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── 정답지 추가/수정 ── */}
      {tab==="edit"&&(
        <Card>
          <SectionTitle>{selKey?"정답지 수정":"새 정답지 추가"}</SectionTitle>

          {/* 시험 유형 선택 */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,color:"#888780",marginBottom:6}}>시험 유형 *</div>
            <div style={{display:"flex",gap:8}}>
              {[["과제물","📁"],["모의고사","📄"],["내신","🏫"]].map(([type,icon])=>(
                <button key={type} onClick={()=>setEditForm({...editForm,examType:type})}
                  style={{flex:1,padding:"10px",borderRadius:10,cursor:"pointer",border:`1.5px solid ${editForm.examType===type?"#185FA5":"#D3D1C7"}`,background:editForm.examType===type?"#E6F1FB":"white",color:editForm.examType===type?"#185FA5":"#888780",fontWeight:editForm.examType===type?600:400,fontSize:13}}>
                  {icon} {type}
                </button>
              ))}
            </div>
          </div>

          {/* 모의고사/내신일 때 과목 선택 */}
          {(editForm.examType==="모의고사"||editForm.examType==="내신")&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,color:"#888780",marginBottom:6}}>과목</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["영어","국어","수학","사회","과학","기타"].map(sub=>(
                  <button key={sub} onClick={()=>setEditForm({...editForm,examSubject:sub})}
                    style={{padding:"6px 14px",borderRadius:8,cursor:"pointer",border:`0.5px solid ${editForm.examSubject===sub?"#185FA5":"#D3D1C7"}`,background:editForm.examSubject===sub?"#E6F1FB":"transparent",color:editForm.examSubject===sub?"#185FA5":"#888780",fontSize:13,fontWeight:editForm.examSubject===sub?500:400}}>
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div>
              <div style={{fontSize:12,color:"#888780",marginBottom:4}}>시험 이름 *</div>
              <input value={editForm.title} onChange={e=>setEditForm({...editForm,title:e.target.value})} placeholder="예: 3월 4주차 단어시험"
                style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{fontSize:12,color:"#888780",marginBottom:4}}>주차명</div>
              <input value={editForm.week} onChange={e=>setEditForm({...editForm,week:e.target.value})} placeholder="예: 3월 4주차"
                style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{fontSize:12,color:"#888780",marginBottom:4}}>시험 날짜</div>
              <input type="date" value={editForm.testDate} onChange={e=>setEditForm({...editForm,testDate:e.target.value})}
                style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{fontSize:12,color:"#888780",marginBottom:4}}>문항 수</div>
              <select value={editForm.qCount} onChange={e=>handleQCount(parseInt(e.target.value))}
                style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}>
                {[10,15,20,25,30,35,40,45].map(n=><option key={n} value={n}>{n}문항</option>)}
              </select>
            </div>
          </div>

          <SectionTitle>공개 대상 설정</SectionTitle>
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              {[["전체","전체 공개"],["반별","반별 공개"],["개인별","개인별 공개"]].map(([v,label])=>(
                <button key={v} onClick={()=>setEditForm({...editForm,targetType:v,targetCls:[],targetStudents:[]})}
                  style={{padding:"6px 14px",borderRadius:8,cursor:"pointer",border:`0.5px solid ${editForm.targetType===v?"#185FA5":"#D3D1C7"}`,background:editForm.targetType===v?"#E6F1FB":"transparent",color:editForm.targetType===v?"#185FA5":"#888780",fontWeight:editForm.targetType===v?500:400,fontSize:12}}>
                  {label}
                </button>
              ))}
            </div>
            {editForm.targetType==="반별"&&(
              <div style={{background:"#F1EFE8",borderRadius:8,padding:"10px 12px",display:"flex",gap:6}}>
                {["A","B","C","D","E","F"].map(cls=>(
                  <button key={cls} onClick={()=>setEditForm(prev=>{const arr=prev.targetCls.includes(cls)?prev.targetCls.filter(c=>c!==cls):[...prev.targetCls,cls];return {...prev,targetCls:arr};})}
                    style={{padding:"6px 16px",borderRadius:8,cursor:"pointer",border:`0.5px solid ${editForm.targetCls.includes(cls)?"#185FA5":"#D3D1C7"}`,background:editForm.targetCls.includes(cls)?"#E6F1FB":"white",color:editForm.targetCls.includes(cls)?"#185FA5":"#888780",fontWeight:500,fontSize:13}}>
                    {cls}반
                  </button>
                ))}
              </div>
            )}
            {editForm.targetType==="개인별"&&(
              <div style={{background:"#F1EFE8",borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:11,color:"#888780",marginBottom:6}}>공개할 학생 선택</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {STUDENTS.map(s=>(
                    <button key={s.id} onClick={()=>setEditForm(prev=>{const arr=prev.targetStudents.includes(s.id)?prev.targetStudents.filter(x=>x!==s.id):[...prev.targetStudents,s.id];return {...prev,targetStudents:arr};})}
                      style={{padding:"5px 12px",borderRadius:8,cursor:"pointer",border:`0.5px solid ${editForm.targetStudents.includes(s.id)?"#185FA5":"#D3D1C7"}`,background:editForm.targetStudents.includes(s.id)?"#E6F1FB":"white",color:editForm.targetStudents.includes(s.id)?"#185FA5":"#888780",fontSize:12,fontWeight:editForm.targetStudents.includes(s.id)?500:400}}>
                      {s.name} <span style={{fontSize:10,color:"#888780"}}>({s.cls}반)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <SectionTitle>정답 입력 (클릭하여 선택)</SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(editChunks.length,3)},1fr)`,gap:12,marginBottom:16}}>
            {editChunks.map(([start,end])=>(
              <div key={start}>
                <div style={{fontSize:11,fontWeight:500,color:"#888780",marginBottom:6,paddingBottom:4,borderBottom:"0.5px solid #D3D1C7"}}>{start+1}번 — {end}번</div>
                {Array.from({length:end-start},(_,j)=>{
                  const i=start+j;
                  return(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:"0.5px solid #F1EFE8"}}>
                      <div style={{width:24,height:24,borderRadius:"50%",background:editForm.answers[i]>0?"#EAF3DE":"#F1EFE8",color:editForm.answers[i]>0?"#27500A":"#888780",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:500,flexShrink:0}}>{i+1}</div>
                      <div style={{display:"flex",gap:3}}>
                        {[1,2,3,4,5].map(v=>(
                          <button key={v} onClick={()=>setAns(i,v)} style={{width:28,height:24,borderRadius:4,cursor:"pointer",fontSize:11,fontWeight:500,border:`0.5px solid ${editForm.answers[i]===v?"#97C459":"#D3D1C7"}`,background:editForm.answers[i]===v?"#EAF3DE":"transparent",color:editForm.answers[i]===v?"#27500A":"#888780"}}>{v}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <BtnSecondary onClick={()=>setTab("list")}>취소</BtnSecondary>
            <BtnPrimary onClick={saveKey}>{selKey?"수정 완료":"저장 & 공개"}</BtnPrimary>
          </div>
        </Card>
      )}

      {/* ── 학생 채점 ── */}
      {tab==="student"&&(
        <div>
          {!selKey?(
            <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13}}>
              "정답지 목록" 탭에서 채점할 시험을 선택해주세요
            </div>
          ):(
            <>
              <div style={{background:"#F1EFE8",borderRadius:8,padding:"8px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:8,fontSize:13}}>
                <span style={{fontWeight:500}}>{selKey.title}</span>
                <span style={{color:"#888780"}}>·</span>
                <span style={{color:"#888780"}}>{selKey.test_date}</span>
                <span style={{color:"#888780"}}>·</span>
                <span style={{color:"#888780"}}>{selKey.q_count}문항</span>
                <button onClick={()=>setTab("list")} style={{marginLeft:"auto",fontSize:11,padding:"3px 10px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",cursor:"pointer",color:"#888780"}}>시험 변경</button>
              </div>
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
                          return(
                            <div key={i} style={{display:"flex",alignItems:"center",gap:3,marginBottom:3}}>
                              <span style={{fontSize:10,color:"#888780",width:20,textAlign:"right",flexShrink:0}}>{i+1}</span>
                              <div style={{display:"flex",gap:2}}>
                                {[1,2,3,4,5].map(v=>{
                                  const isSelected=curAns[i]===v;const showResult=!!curScore;
                                  let bg="transparent",color="#888780",border="0.5px solid #D3D1C7";
                                  if(showResult){
                                    if(isSelected&&selKey.answers[i]===v){bg="#EAF3DE";color="#27500A";border="0.5px solid #97C459";}
                                    else if(isSelected&&selKey.answers[i]!==v){bg="#FCEBEB";color="#791F1F";border="0.5px solid #F09595";}
                                    else if(!isSelected&&selKey.answers[i]===v&&curAns[i]!==0){bg="#EAF3DE";color="#27500A";border="0.5px solid #97C459";}
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
                      <div style={{fontSize:12,color:"#888780",marginBottom:8}}>{curScore.correct}/{curScore.total}문항 정답</div>
                      <div style={{height:8,background:"#F1EFE8",borderRadius:99,overflow:"hidden",marginBottom:4}}><div style={{width:pct+"%",height:"100%",background:barCol,borderRadius:99}}/></div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:16}}><span style={{color:"#27500A"}}>정답 {curScore.correct}개</span><span style={{color:"#E24B4A"}}>오답 {curScore.wrong.length}개</span></div>
                      {curScore.wrong.length>0?(<><SectionTitle>틀린 문항</SectionTitle>{curScore.wrong.map(qn=>(<div key={qn} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:"0.5px solid #F1EFE8",fontSize:12}}><div style={{width:22,height:22,borderRadius:"50%",background:"#FCEBEB",color:"#791F1F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:500}}>{qn}</div><span style={{color:"#888780"}}>정답</span><Badge label={selKey.answers[qn-1]+"번"} type="green"/><span style={{color:"#888780"}}>학생</span><Badge label={curAns[qn-1]+"번"} type="red"/></div>))}</>):<div style={{textAlign:"center",padding:"1rem",color:"#27500A",fontWeight:500}}>만점! 🎉</div>}
                    </Card>
                  ):<div style={{fontSize:13,color:"#888780",textAlign:"center",padding:"3rem 0"}}>채점 버튼을 누르면<br/>결과가 여기 표시돼요</div>}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── 전체 결과 ── */}
      {tab==="results"&&(
        <div>
          {!selKey?(
            <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13}}>"정답지 목록" 탭에서 채점할 시험을 선택해주세요</div>
          ):(
            <>
              <div style={{background:"#F1EFE8",borderRadius:8,padding:"8px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:8,fontSize:13}}>
                <span style={{fontWeight:500}}>{selKey.title}</span>
                <span style={{color:"#888780"}}>· {selKey.test_date} · {selKey.q_count}문항</span>
                <button onClick={()=>setTab("list")} style={{marginLeft:"auto",fontSize:11,padding:"3px 10px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",cursor:"pointer",color:"#888780"}}>시험 변경</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
                <KpiCard label="채점 완료" value={graded.length+"명"} sub={`전체 ${filteredStudents.length}명`}/>
                <KpiCard label="평균 점수" value={avg+"점"} sub={`최고 ${scores.length?Math.max(...scores):0}점`}/>
                <KpiCard label="합격(70점↑)" value={scores.filter(s=>s>=70).length+"명"} sub={scores.length?Math.round(scores.filter(s=>s>=70).length/scores.length*100)+"%":"—"} valueColor="#27500A"/>
                <KpiCard label="미채점" value={(filteredStudents.length-graded.length)+"명"} sub="답안 미입력"/>
              </div>
              <div style={{marginBottom:12}}><ClassFilter value={filterCls} onChange={setFilterCls}/></div>
              <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{background:"#F1EFE8"}}>{["등수","학생","반","점수","등급","정답","틀린 문항"].map((h,i)=><th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {[...graded].sort((a,b)=>studentScores[b.id].score-studentScores[a.id].score).map((s,i)=>{
                      const r=studentScores[s.id];const p=r.score;
                      const g=p>=90?"A":p>=80?"B":p>=70?"C":"D↓";
                      const gType=p>=90?"green":p>=80?"blue":p>=70?"amber":"red";
                      const bc=p>=80?"#639922":p>=65?"#BA7517":"#E24B4A";
                      return(<tr key={s.id} style={{borderBottom:"0.5px solid #D3D1C7"}} onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{padding:"8px 12px",fontWeight:500,color:i<3?"#BA7517":"#888780"}}>{i+1}</td>
                        <td style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={s.name} idx={s.id} size={26}/><span>{s.name}</span></div></td>
                        <td style={{padding:"8px 12px"}}><Badge label={clsLabel(s.cls)} type={{A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"}[s.cls]}/></td>
                        <td style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:60,height:5,background:"#F1EFE8",borderRadius:99,overflow:"hidden"}}><div style={{width:p+"%",height:"100%",background:bc,borderRadius:99}}/></div><span style={{fontWeight:500,color:bc}}>{p}</span></div></td>
                        <td style={{padding:"8px 12px"}}><Badge label={g} type={gType}/></td>
                        <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{r.correct}/{r.total}</td>
                        <td style={{padding:"8px 12px"}}>{r.wrong.slice(0,4).map(n=><Badge key={n} label={n+"번"} type="red"/>)}{r.wrong.length>4&&<span style={{fontSize:11,color:"#888780"}}> +{r.wrong.length-4}</span>}</td>
                      </tr>);
                    })}
                    {filteredStudents.filter(s=>!studentScores[s.id]).map(s=>(<tr key={s.id} style={{borderBottom:"0.5px solid #D3D1C7",opacity:0.4}}><td style={{padding:"8px 12px",color:"#888780"}}>—</td><td style={{padding:"8px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={s.name} idx={s.id} size={26}/><span>{s.name}</span></div></td><td style={{padding:"8px 12px"}}><Badge label={clsLabel(s.cls)} type={{A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"}[s.cls]}/></td><td colSpan={4} style={{padding:"8px 12px",color:"#888780",fontSize:12}}>미채점</td></tr>))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── 학생 자가채점 결과 탭 ── */}
      {tab==="omr"&&(
        <div>
          {/* 시험 선택 */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:"#888780",marginBottom:8,fontWeight:500}}>시험 선택</div>
            {answerKeys.length===0?(
              <div style={{fontSize:13,color:"#888780"}}>등록된 정답지가 없어요</div>
            ):(
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {answerKeys.map(k=>(
                  <button key={k.id} onClick={()=>{setSelKey(k);loadOmrResults(k.id);}}
                    style={{padding:"8px 14px",borderRadius:8,cursor:"pointer",border:`0.5px solid ${selKey?.id===k.id?"#185FA5":"#D3D1C7"}`,background:selKey?.id===k.id?"#E6F1FB":"white",textAlign:"left"}}>
                    <div style={{fontSize:13,fontWeight:500,color:selKey?.id===k.id?"#185FA5":"#2C2C2A"}}>{k.title||k.week}</div>
                    <div style={{fontSize:11,color:"#888780",marginTop:2}}>📅 {k.test_date} · {k.q_count}문항</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selKey&&(
            <>
              {/* 요약 */}
              {omrResults.length>0&&(()=>{
                const scores=omrResults.map(r=>r.score);
                const avg=Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
                const passCount=omrResults.filter(r=>r.score>=70).length;
                return(
                  <>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
                    <KpiCard label="제출 학생" value={omrResults.length+"명"} sub={`전체 ${STUDENTS.length}명 중`}/>
                    <KpiCard label="평균 점수" value={avg+"점"} sub={`최고 ${Math.max(...scores)}점`}/>
                    <KpiCard label="합격(70점↑)" value={passCount+"명"} sub={Math.round(passCount/omrResults.length*100)+"%"} valueColor="#27500A"/>
                    <KpiCard label="미제출" value={(STUDENTS.length-omrResults.length)+"명"} sub="" valueColor="#E24B4A"/>
                  </div>
                  <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
                    <button onClick={()=>setStatsModal({keyData:selKey,allScores:omrResults})}
                      style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"0.5px solid #185FA5",background:"#E6F1FB",color:"#0C447C",cursor:"pointer",fontWeight:500}}>
                      📊 통계 보기 (등수·평균·표준편차)
                    </button>
                  </div>
                  </>
                );
              })()}

              {omrResults.length===0?(
                <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13}}>
                  아직 이 시험을 제출한 학생이 없어요
                </div>
              ):(
                <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                    <thead><tr style={{background:"#F1EFE8"}}>
                      {["학생","반","점수","등급","정답","오답","틀린 문항","제출 시각"].map((h,i)=>(
                        <th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {[...omrResults].sort((a,b)=>b.score-a.score).map((r,i)=>{
                        const p=r.score;
                        const g=p>=90?"A":p>=80?"B":p>=70?"C":p>=60?"D":"F";
                        const gType=p>=90?"green":p>=80?"blue":p>=70?"amber":"red";
                        const bc=p>=80?"#639922":p>=65?"#BA7517":"#E24B4A";
                        return(
                          <tr key={r.id} style={{borderBottom:"0.5px solid #D3D1C7"}}
                            onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"}
                            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            <td style={{padding:"8px 12px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:8}}>
                                <div style={{width:26,height:26,borderRadius:"50%",background:AVATAR_COLORS[r.student_id%AVATAR_COLORS.length].bg,color:AVATAR_COLORS[r.student_id%AVATAR_COLORS.length].c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:500,flexShrink:0}}>{r.student_name?.slice(0,2)}</div>
                                <span>{r.student_name}</span>
                              </div>
                            </td>
                            <td style={{padding:"8px 12px"}}><Badge label={clsLabel(r.cls)} type={{A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"}[r.cls]||"gray"}/></td>
                            <td style={{padding:"8px 12px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:5}}>
                                <div style={{width:60,height:5,background:"#F1EFE8",borderRadius:99,overflow:"hidden"}}>
                                  <div style={{width:p+"%",height:"100%",background:bc,borderRadius:99}}/>
                                </div>
                                <span style={{fontWeight:500,color:bc}}>{p}점</span>
                              </div>
                            </td>
                            <td style={{padding:"8px 12px"}}><Badge label={g} type={gType}/></td>
                            <td style={{padding:"8px 12px",color:"#27500A",fontWeight:500}}>{r.correct}</td>
                            <td style={{padding:"8px 12px",color:"#E24B4A",fontWeight:500}}>{r.wrong?.length||0}</td>
                            <td style={{padding:"8px 12px"}}>
                              <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                                {(r.wrong||[]).slice(0,5).map(qn=>(
                                  <span key={qn} style={{padding:"1px 6px",borderRadius:4,background:"#FCEBEB",fontSize:11,color:"#791F1F"}}>{qn}번</span>
                                ))}
                                {(r.wrong||[]).length>5&&<span style={{fontSize:11,color:"#888780"}}>+{r.wrong.length-5}</span>}
                              </div>
                            </td>
                            <td style={{padding:"8px 12px",fontSize:11,color:"#888780"}}>
                              {new Date(r.created_at).toLocaleString("ko-KR",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"})}
                            </td>
                          </tr>
                        );
                      })}
                      {/* 미제출 학생 */}
                      {STUDENTS.filter(s=>!omrResults.find(r=>r.student_id===s.id)).map(s=>(
                        <tr key={s.id} style={{borderBottom:"0.5px solid #D3D1C7",opacity:0.4}}>
                          <td style={{padding:"8px 12px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <Avatar name={s.name} idx={s.id} size={26}/>
                              <span>{s.name}</span>
                            </div>
                          </td>
                          <td style={{padding:"8px 12px"}}><Badge label={clsLabel(s.cls)} type={{A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"}[s.cls]}/></td>
                          <td colSpan={6} style={{padding:"8px 12px",color:"#888780",fontSize:12}}>미제출</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
// ════════════════════════════════════════════════
// 시험 통계 모달 (점수 입력 & 채점 공용)
// ════════════════════════════════════════════════
function ExamStatsModal({keyData,allScores,isWordTest=false,onClose}){
  // allScores: [{student_id, student_name, cls, score, pass}]
  if(!allScores||allScores.length===0) return null;

  const scores = allScores.map(r=>r.score).sort((a,b)=>a-b);
  const n = scores.length;
  const avg = Math.round(scores.reduce((a,b)=>a+b,0)/n);
  const variance = scores.reduce((a,b)=>a+(b-avg)**2,0)/n;
  const std = Math.round(Math.sqrt(variance)*10)/10;
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const passCount = allScores.filter(r=>r.pass||r.score>=70).length;

  // 반별 평균
  const clsAvg = {};
  ["A","B","C","D","E","F"].forEach(cls=>{
    const recs = allScores.filter(r=>r.cls===cls);
    if(recs.length>0) clsAvg[cls] = Math.round(recs.reduce((a,b)=>a+b.score,0)/recs.length);
  });

  // 분포 구간 (0~19, 20~39, 40~59, 60~69, 70~79, 80~89, 90~100)
  const bands = [
    {label:"90~100",min:90,max:100,color:"#639922"},
    {label:"80~89", min:80,max:89, color:"#7AAD2A"},
    {label:"70~79", min:70,max:79, color:"#BA7517"},
    {label:"60~69", min:60,max:69, color:"#D4641A"},
    {label:"0~59",  min:0, max:59, color:"#E24B4A"},
  ];
  const bandCounts = bands.map(b=>({
    ...b,
    count:scores.filter(s=>s>=b.min&&s<=b.max).length,
  }));
  const maxCount = Math.max(...bandCounts.map(b=>b.count),1);

  // 순위표
  const ranked = [...allScores].sort((a,b)=>b.score-a.score);

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"white",borderRadius:16,padding:"1.5rem",width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        {/* 헤더 */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <div style={{fontSize:16,fontWeight:500,color:"#2C2C2A"}}>{keyData?.title||keyData?.week||"시험 통계"}</div>
            <div style={{fontSize:12,color:"#888780",marginTop:2}}>{keyData?.test_date} · {keyData?.q_count||allScores[0]?.total}문항</div>
          </div>
          <button onClick={onClose} style={{fontSize:18,background:"transparent",border:"none",cursor:"pointer",color:"#888780"}}>✕</button>
        </div>

        {/* KPI */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>
          <KpiCard label="전체 평균" value={avg+"점"} sub={`${n}명 응시`}/>
          <KpiCard label="표준편차" value={std} sub={`최고 ${max}점`}/>
          {isWordTest
            ?<KpiCard label="통과 횟수" value={passCount+"명"} sub={Math.round(passCount/n*100)+"%"} valueColor="#27500A"/>
            :<KpiCard label="최고점" value={max+"점"} sub="" valueColor="#27500A"/>
          }
          <KpiCard label="최저점" value={min+"점"} sub="" valueColor="#E24B4A"/>
        </div>

        {/* 반별 평균 */}
        {Object.keys(clsAvg).length>0&&(
          <div style={{marginBottom:20}}>
            <SectionTitle>반별 평균</SectionTitle>
            <div style={{display:"flex",gap:8}}>
              {Object.entries(clsAvg).map(([cls,avg])=>(
                <div key={cls} style={{flex:1,background:"#F1EFE8",borderRadius:8,padding:"10px",textAlign:"center"}}>
                  <div style={{fontSize:11,color:"#888780",marginBottom:4}}>{cls}반</div>
                  <div style={{fontSize:22,fontWeight:500,color:"#185FA5"}}>{avg}</div>
                  <div style={{fontSize:11,color:"#888780"}}>점</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 점수 분포 그래프 */}
        <div style={{marginBottom:20}}>
          <SectionTitle>점수 분포</SectionTitle>
          <div style={{display:"flex",gap:6,alignItems:"flex-end",height:100,padding:"0 4px"}}>
            {bandCounts.map(b=>(
              <div key={b.label} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{fontSize:11,color:b.color,fontWeight:500}}>{b.count}명</div>
                <div style={{width:"100%",background:b.color,borderRadius:"4px 4px 0 0",height:Math.max(b.count/maxCount*80,b.count>0?8:0)+"px",transition:"height 0.3s"}}/>
                <div style={{fontSize:9,color:"#888780",textAlign:"center"}}>{b.label}</div>
              </div>
            ))}
          </div>
          {/* 정규분포 곡선 SVG */}
          <div style={{marginTop:12}}>
            <div style={{fontSize:12,color:"#888780",marginBottom:6}}>점수 분포 곡선 (평균: {avg}점, 표준편차: {std})</div>
            <svg width="100%" height="60" viewBox="0 0 400 60" style={{overflow:"visible"}}>
              {/* 배경 영역 */}
              <defs>
                <linearGradient id="curve_grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#E24B4A" stopOpacity="0.3"/>
                  <stop offset="30%" stopColor="#BA7517" stopOpacity="0.3"/>
                  <stop offset="60%" stopColor="#7AAD2A" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#639922" stopOpacity="0.3"/>
                </linearGradient>
              </defs>
              {/* 그래프 선 */}
              {(()=>{
                const pts = [];
                for(let i=0;i<=100;i+=2){
                  const z=(i-avg)/Math.max(std,1);
                  const y=Math.exp(-0.5*z*z);
                  pts.push([i/100*400, 55-y*50]);
                }
                const path = "M "+pts.map(p=>p.join(",")).join(" L ");
                const area = "M 0,55 L "+pts.map(p=>p.join(",")).join(" L ")+" L 400,55 Z";
                return(<>
                  <path d={area} fill="url(#curve_grad)"/>
                  <path d={path} stroke="#185FA5" strokeWidth="2" fill="none"/>
                  {/* 평균선 */}
                  <line x1={avg/100*400} y1="0" x2={avg/100*400} y2="55" stroke="#185FA5" strokeWidth="1.5" strokeDasharray="4,2"/>
                  <text x={avg/100*400+4} y="12" fontSize="9" fill="#185FA5">평균</text>
                </>);
              })()}
            </svg>
          </div>
        </div>

        {/* 순위표 */}
        <div>
          <SectionTitle>순위표</SectionTitle>
          <div style={{border:"0.5px solid #D3D1C7",borderRadius:8,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"#F1EFE8"}}>
                {["등수","이름","반","점수","합격"].map((h,i)=>(
                  <th key={i} style={{padding:"7px 10px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {ranked.map((r,i)=>{
                  const col=r.score>=80?"#639922":r.score>=70?"#BA7517":"#E24B4A";
                  return(
                    <tr key={r.id||i} style={{borderBottom:"0.5px solid #F1EFE8"}}>
                      <td style={{padding:"6px 10px",fontWeight:500,color:i<3?"#BA7517":"#888780"}}>{i+1}</td>
                      <td style={{padding:"6px 10px",fontWeight:500}}>{r.student_name}</td>
                      <td style={{padding:"6px 10px"}}><Badge label={clsLabel(r.cls)} type={{A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"}[r.cls]||"gray"}/></td>
                      <td style={{padding:"6px 10px",fontWeight:500,color:col}}>{r.score}점</td>
                      <td style={{padding:"6px 10px"}}><Badge label={r.pass||r.score>=70?"합격":"불합격"} type={r.pass||r.score>=70?"green":"red"}/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// 리포트 (강사용 — 통합 학습 리포트)
// ════════════════════════════════════════════════
// ════════════════════════════════════════════════
// 성적 입력 모달 (강사용)
// ════════════════════════════════════════════════
function ExamScoreModal({student,onClose,onSaved}){
  const [form,setForm]=useState({
    exam_type:"mock", exam_name:"", exam_date:"", subject:"영어",
    score:"", max_score:100, grade:"", note:"",
  });
  const [saving,setSaving]=useState(false);

  const save=async()=>{
    if(!form.exam_name.trim()){alert("시험명을 입력해주세요.");return;}
    if(!form.score){alert("점수를 입력해주세요.");return;}
    setSaving(true);
    const {data,error}=await supabase.from("exam_scores").insert({
      student_id:student.id, student_name:student.name, cls:student.cls,
      exam_type:form.exam_type, exam_name:form.exam_name,
      exam_date:form.exam_date, subject:form.subject,
      score:parseInt(form.score), max_score:parseInt(form.max_score)||100,
      grade:form.grade, note:form.note,
    }).select().single();
    setSaving(false);
    if(error){alert("저장 중 오류가 발생했습니다.");return;}
    if(onSaved) onSaved(data);
    onClose();
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"white",borderRadius:16,padding:"1.5rem",width:"100%",maxWidth:440}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:500,color:"#2C2C2A"}}>{student.name} 성적 입력</div>
          <button onClick={onClose} style={{fontSize:18,background:"transparent",border:"none",cursor:"pointer",color:"#888780"}}>✕</button>
        </div>
        {/* 시험 종류 */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,color:"#888780",marginBottom:6}}>시험 종류</div>
          <div style={{display:"flex",gap:8}}>
            {[["mock","모의고사"],["school","내신"]].map(([v,label])=>(
              <button key={v} onClick={()=>setForm({...form,exam_type:v})}
                style={{flex:1,padding:"8px",borderRadius:8,cursor:"pointer",border:`0.5px solid ${form.exam_type===v?"#185FA5":"#D3D1C7"}`,background:form.exam_type===v?"#E6F1FB":"transparent",color:form.exam_type===v?"#185FA5":"#888780",fontWeight:form.exam_type===v?500:400,fontSize:13}}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div style={{gridColumn:"1/-1"}}>
            <div style={{fontSize:12,color:"#888780",marginBottom:4}}>시험명 *</div>
            <input value={form.exam_name} onChange={e=>setForm({...form,exam_name:e.target.value})}
              placeholder={form.exam_type==="mock"?"예: 2026년 3월 모의고사":"예: 1학기 중간고사"}
              style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{fontSize:12,color:"#888780",marginBottom:4}}>시험 날짜</div>
            <input type="date" value={form.exam_date} onChange={e=>setForm({...form,exam_date:e.target.value})}
              style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{fontSize:12,color:"#888780",marginBottom:4}}>과목</div>
            <select value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}
              style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}>
              {["영어","국어","수학","사회","과학","기타"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <div style={{fontSize:12,color:"#888780",marginBottom:4}}>점수 *</div>
            <input type="number" value={form.score} onChange={e=>setForm({...form,score:e.target.value})} placeholder="예: 85"
              style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{fontSize:12,color:"#888780",marginBottom:4}}>만점</div>
            <input type="number" value={form.max_score} onChange={e=>setForm({...form,max_score:e.target.value})}
              style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
          </div>
          <div>
            <div style={{fontSize:12,color:"#888780",marginBottom:4}}>등급 (선택)</div>
            <input value={form.grade} onChange={e=>setForm({...form,grade:e.target.value})} placeholder="예: 2등급"
              style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <div style={{fontSize:12,color:"#888780",marginBottom:4}}>메모 (선택)</div>
            <input value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="예: 어법 파트 집중 보완 필요"
              style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
          <BtnSecondary onClick={onClose}>취소</BtnSecondary>
          <BtnPrimary onClick={save} disabled={saving}>{saving?"저장 중...":"저장"}</BtnPrimary>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// 성적 추이 미니 차트
// ════════════════════════════════════════════════
function ScoreTrendChart({data,maxScore=100,height=60}){
  if(!data||data.length<2) return(
    <div style={{textAlign:"center",padding:"1rem",color:"#888780",fontSize:12}}>
      데이터가 2개 이상 있어야 추이를 볼 수 있어요
    </div>
  );
  const scores=data.map(d=>d.score);
  const min=Math.min(...scores);
  const max=Math.max(...scores);
  const range=max-min||1;
  const w=400; const h=height;
  const pad=20;
  const pts=data.map((d,i)=>[
    pad+(i/(data.length-1))*(w-pad*2),
    h-pad-((d.score-min)/range)*(h-pad*2),
  ]);
  const path="M "+pts.map(p=>p.join(",")).join(" L ");
  const area="M "+pts[0][0]+","+h+" L "+pts.map(p=>p.join(",")).join(" L ")+" L "+pts[pts.length-1][0]+","+h+" Z";

  return(
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{overflow:"visible"}}>
      <defs>
        <linearGradient id="trend_grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#185FA5" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#185FA5" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#trend_grad)"/>
      <path d={path} stroke="#185FA5" strokeWidth="2" fill="none" strokeLinejoin="round"/>
      {pts.map((p,i)=>{
        const score=data[i].score;
        const col=score/maxScore>=0.8?"#639922":score/maxScore>=0.65?"#BA7517":"#E24B4A";
        return(
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r="4" fill={col} stroke="white" strokeWidth="1.5"/>
            <text x={p[0]} y={p[1]-8} textAnchor="middle" fontSize="9" fill={col} fontWeight="500">{score}</text>
            <text x={p[0]} y={h-2} textAnchor="middle" fontSize="8" fill="#888780">{data[i].label?.slice(0,6)}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ════════════════════════════════════════════════
// 리포트 (강사용 — 통합 학습 리포트)
// ════════════════════════════════════════════════
function Report({attendanceData,scoresData}){
  const [selStudentId,setSelStudentId] = useState(null);
  const [clinicData,setClinicData]     = useState([]);
  const [omrData,setOmrData]           = useState([]);
  const [answerKeys,setAnswerKeys]     = useState([]);
  const [examScores,setExamScores]     = useState([]); // 모의고사/내신
  const [loading,setLoading]           = useState(false);
  const [statsModal,setStatsModal]     = useState(null);
  const [comment,setComment]           = useState("");
  const [showExamModal,setShowExamModal] = useState(false);
  const [trendTab,setTrendTab]         = useState("mock"); // mock|school|homework
  const [deleteConfirm,setDeleteConfirm] = useState(null);

  const s = STUDENTS.find(x=>x.id===selStudentId)||STUDENTS[0];

  useEffect(()=>{
    if(STUDENTS.length>0&&!selStudentId) setSelStudentId(STUDENTS[0].id);
  },[]);

  useEffect(()=>{
    if(!selStudentId) return;
    setLoading(true);
    Promise.all([
      supabase.from("clinic_requests").select("*").eq("student_id",selStudentId).order("created_at",{ascending:false}),
      supabase.from("omr_results").select("*").eq("student_id",selStudentId).order("created_at",{ascending:false}),
      supabase.from("answer_keys").select("*").order("test_date",{ascending:false}),
      supabase.from("exam_scores").select("*").eq("student_id",selStudentId).order("exam_date",{ascending:true}),
    ]).then(([clinic,omr,keys,exams])=>{
      setClinicData(clinic.data||[]);
      setOmrData(omr.data||[]);
      setAnswerKeys(keys.data||[]);
      setExamScores(exams.data||[]);
      setLoading(false);
    });
  },[selStudentId]);

  const openStats=async(keyId)=>{
    const key=answerKeys.find(k=>k.id===keyId);
    const {data}=await supabase.from("omr_results").select("*").eq("answer_key_id",keyId);
    setStatsModal({keyData:key,allScores:data||[]});
  };

  const openScoreStats=async(week)=>{
    const allScoreRecs=Object.values(scoresData).flat().filter(r=>r.week===week);
    setStatsModal({keyData:{title:week,test_date:week},allScores:allScoreRecs.map(r=>({...r,student_name:r.student_name,pass:r.pass}))});
  };

  // 모의고사/내신 통계
  const openExamStats=async(examName,examDate)=>{
    const {data}=await supabase.from("exam_scores").select("*").eq("exam_name",examName).eq("exam_date",examDate);
    if(!data||data.length===0) return;
    setStatsModal({
      keyData:{title:examName,test_date:examDate,q_count:data[0]?.max_score||100},
      allScores:data.map(r=>({id:r.id,student_id:r.student_id,student_name:r.student_name,cls:r.cls,score:r.score,pass:r.score/(r.max_score||100)>=0.7,max_score:r.max_score||100})),
    });
  };

  // 과제물(OMR) 통계 — 시험명+날짜 기준으로 전체 학생 결과
  const openHwStats=async(title,testDate)=>{
    const {data}=await supabase.from("omr_results").select("*")
      .eq("title",title).eq("test_date",testDate);
    // title 기준 없으면 week 기준으로도 시도
    const records=data&&data.length>0?data:[];
    if(records.length===0){
      const {data:d2}=await supabase.from("omr_results").select("*").eq("week",title);
      if(d2&&d2.length>0){
        setStatsModal({keyData:{title,test_date:testDate},allScores:d2.map(r=>({...r,pass:r.score>=70}))});
        return;
      }
    }
    setStatsModal({keyData:{title,test_date:testDate},allScores:records.map(r=>({...r,pass:r.score>=70}))});
  };

  const deleteExam=async(id)=>{
    await supabase.from("exam_scores").delete().eq("id",id);
    setExamScores(prev=>prev.filter(x=>x.id!==id));
    setDeleteConfirm(null);
  };

  if(!s) return <div style={{padding:"2rem",textAlign:"center",color:"#888780"}}>학생 정보를 불러오는 중...</div>;

  // 학생 데이터
  const myAtt    = (attendanceData[s.id]||[]);
  const attCount = myAtt.filter(r=>r.status==="O").length;
  const attTotal = myAtt.length;
  const attPct   = attTotal>0?Math.round(attCount/attTotal*100):0;
  const lateCount= myAtt.filter(r=>r.status==="L").length;
  const myScores = (scoresData[s.id]||[]).slice(0,10).reverse();
  const latestScore = myScores.length>0?myScores[myScores.length-1].score:null;
  const allWordTests2 = (scoresData[s.id]||[]);
  const passTotal   = allWordTests2.filter(r=>r.pass).length;
  const wordTotal2  = allWordTests2.length;
  const confirmedClinics = clinicData.filter(r=>r.status==="confirmed").length;

  // 성적 추이 데이터 가공
  const mockScores   = examScores.filter(e=>e.exam_type==="mock").map(e=>({label:e.exam_name,score:e.score,date:e.exam_date,grade:e.grade,subject:e.subject,note:e.note,id:e.id,max:e.max_score}));
  const schoolScores = examScores.filter(e=>e.exam_type==="school").map(e=>({label:e.exam_name,score:e.score,date:e.exam_date,grade:e.grade,subject:e.subject,note:e.note,id:e.id,max:e.max_score}));
  const hwScores     = omrData.map(e=>({label:e.title||e.week,score:e.score,date:e.test_date,id:e.id,max:100}));

  const trendData = trendTab==="mock"?mockScores:trendTab==="school"?schoolScores:hwScores;
  const trendAvg  = trendData.length>0?Math.round(trendData.reduce((a,b)=>a+b.score,0)/trendData.length):null;
  const trendMax  = trendData.length>0?Math.max(...trendData.map(d=>d.score)):null;
  const trendMin  = trendData.length>0?Math.min(...trendData.map(d=>d.score)):null;

  return(
    <div>
      {statsModal&&<ExamStatsModal keyData={statsModal.keyData} allScores={statsModal.allScores} onClose={()=>setStatsModal(null)}/>}
      {showExamModal&&s&&<ExamScoreModal student={s} onClose={()=>setShowExamModal(false)} onSaved={d=>{setExamScores(prev=>[...prev,d].sort((a,b)=>a.exam_date?.localeCompare(b.exam_date)));}}/>}

      {/* 학생 선택 */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <select value={selStudentId||""} onChange={e=>setSelStudentId(parseInt(e.target.value))}
          style={{fontSize:13,padding:"6px 10px",borderRadius:8,border:"0.5px solid #D3D1C7"}}>
          {STUDENTS.map(s=><option key={s.id} value={s.id}>{s.name} ({s.cls}반)</option>)}
        </select>
        <BtnPrimary onClick={()=>setShowExamModal(true)}>+ 성적 입력</BtnPrimary>
        <BtnSecondary onClick={()=>window.print()}>🖨️ 인쇄</BtnSecondary>
      </div>

      {loading?(
        <div style={{textAlign:"center",padding:"3rem",color:"#888780"}}>불러오는 중...</div>
      ):(
        <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden"}}>
          {/* 헤더 */}
          <div style={{background:"#185FA5",padding:"1.25rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(255,255,255,0.2)",color:"#E6F1FB",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:500}}>{s.name.slice(0,2)}</div>
              <div>
                <div style={{fontSize:18,fontWeight:500,color:"#E6F1FB"}}>{s.name} 학생 통합 학습 리포트</div>
                <div style={{fontSize:12,color:"#85B7EB",marginTop:2,display:"flex",gap:8,flexWrap:"wrap"}}>
                  <span style={{background:"rgba(255,255,255,0.2)",padding:"1px 8px",borderRadius:99,fontSize:11}}>{s.cls}반</span>
                  <span>{s.grade}</span><span>·</span><span>{s.course}</span><span>·</span><span>{s.school}</span>
                </div>
              </div>
            </div>
            <div style={{fontSize:12,color:"#85B7EB",textAlign:"right"}}>{new Date().getFullYear()}년 {new Date().getMonth()+1}월<br/>통합 리포트</div>
          </div>

          <div style={{padding:"1.25rem 1.5rem"}}>
            {/* ① 종합 요약 */}
            <SectionTitle>📊 종합 요약</SectionTitle>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>
              <KpiCard label="출석률" value={attPct+"%"} sub={`${attCount}/${attTotal}회 · 지각 ${lateCount}회`} valueColor={attPct>=80?"#27500A":"#E24B4A"}/>
              <KpiCard label="최근 단어시험" value={latestScore!==null?latestScore+"점":"—"} sub={`통과 ${passTotal}/${wordTotal2}회`} valueColor={latestScore>=85?"#27500A":latestScore>=70?"#BA7517":"#E24B4A"}/>
              <KpiCard label="클리닉 신청" value={clinicData.length+"회"} sub={`확정 ${confirmedClinics}회`}/>
              <KpiCard label="OMR 제출" value={omrData.length+"회"} sub="자가 채점"/>
            </div>

            {/* ② 성적 추이 (3탭) */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:8}}>
              <SectionTitle style={{margin:0}}>📈 성적 추이</SectionTitle>
              <button onClick={()=>setShowExamModal(true)}
                style={{fontSize:11,padding:"4px 10px",borderRadius:6,border:"0.5px solid #185FA5",background:"#E6F1FB",color:"#0C447C",cursor:"pointer"}}>
                + 성적 입력
              </button>
            </div>
            {/* 탭 */}
            <div style={{display:"flex",gap:4,marginBottom:12}}>
              {[["mock",`모의고사 (${mockScores.length})`],["school",`내신 (${schoolScores.length})`],["homework",`과제물 채점 (${hwScores.length})`]].map(([id,label])=>(
                <button key={id} onClick={()=>setTrendTab(id)}
                  style={{fontSize:12,padding:"5px 12px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:trendTab===id?"#185FA5":"#D3D1C7",background:trendTab===id?"#E6F1FB":"transparent",color:trendTab===id?"#185FA5":"#888780",fontWeight:trendTab===id?500:400}}>
                  {label}
                </button>
              ))}
            </div>

            {trendData.length===0?(
              <div style={{background:"#F1EFE8",borderRadius:8,padding:"2rem",textAlign:"center",color:"#888780",fontSize:13,marginBottom:20}}>
                아직 {trendTab==="mock"?"모의고사":trendTab==="school"?"내신":"과제물 채점"} 기록이 없어요
                {trendTab!=="homework"&&<div style={{marginTop:8}}><button onClick={()=>setShowExamModal(true)} style={{fontSize:12,padding:"5px 12px",borderRadius:6,border:"0.5px solid #185FA5",background:"#E6F1FB",color:"#0C447C",cursor:"pointer"}}>+ 성적 입력하기</button></div>}
              </div>
            ):(
              <div style={{marginBottom:20}}>
                {/* KPI */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                  <KpiCard label="평균" value={trendAvg+"점"} sub={`${trendData.length}회 기록`}/>
                  <KpiCard label="최고" value={trendMax+"점"} sub="" valueColor="#27500A"/>
                  <KpiCard label="최저" value={trendMin+"점"} sub="" valueColor="#E24B4A"/>
                </div>
                {/* 차트 */}
                <div style={{background:"#F1EFE8",borderRadius:8,padding:"12px",marginBottom:12}}>
                  <ScoreTrendChart data={trendData} height={80}/>
                </div>
                {/* 상세 목록 */}
                {<div style={{fontSize:11,color:"#888780",marginBottom:6}}>📊 클릭하면 전체 통계 (평균·표준편차·분포·순위)를 볼 수 있어요</div>}
                <div style={{border:"0.5px solid #D3D1C7",borderRadius:8,overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                    <thead><tr style={{background:"#F1EFE8"}}>
                      {["시험명","날짜","과목","점수","등급","메모",""].map((h,i)=><th key={i} style={{padding:"7px 10px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {[...trendData].reverse().map((d,i)=>{
                        const pct=d.score/(d.max||100)*100;
                        const col=pct>=80?"#639922":pct>=65?"#BA7517":"#E24B4A";
                        const isClickable=trendTab==="homework"?(d.label||d.date):d.date;
                        return(
                          <tr key={d.id||i} style={{borderBottom:"0.5px solid #F1EFE8",cursor:isClickable?"pointer":"default"}}
                            onClick={()=>{
                              if(trendTab==="homework"&&(d.label||d.date)) openHwStats(d.label,d.date);
                              else if(isClickable) openExamStats(d.label,d.date);
                            }}
                            onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"}
                            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            <td style={{padding:"7px 10px",fontWeight:500}}>
                              {d.label}
                              {isClickable&&<span style={{fontSize:10,color:"#888780",marginLeft:4}}>📊</span>}
                            </td>
                            <td style={{padding:"7px 10px",color:"#888780",fontSize:12}}>{d.date||"—"}</td>
                            <td style={{padding:"7px 10px",color:"#888780",fontSize:12}}>{d.subject||"—"}</td>
                            <td style={{padding:"7px 10px",fontWeight:500,color:col}}>{d.score}점</td>
                            <td style={{padding:"7px 10px",color:"#888780",fontSize:12}}>{d.grade||"—"}</td>
                            <td style={{padding:"7px 10px",color:"#888780",fontSize:12}}>{d.note||"—"}</td>
                            <td style={{padding:"7px 10px"}}>
                              {trendTab!=="homework"&&(
                                deleteConfirm===d.id?(
                                  <div style={{display:"flex",gap:4}}>
                                    <button onClick={e=>{e.stopPropagation();deleteExam(d.id);}} style={{fontSize:10,padding:"2px 6px",borderRadius:4,border:"none",background:"#FCEBEB",color:"#791F1F",cursor:"pointer"}}>삭제</button>
                                    <button onClick={e=>{e.stopPropagation();setDeleteConfirm(null);}} style={{fontSize:10,padding:"2px 6px",borderRadius:4,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>취소</button>
                                  </div>
                                ):(
                                  <button onClick={e=>{e.stopPropagation();setDeleteConfirm(d.id);}} style={{fontSize:10,padding:"2px 6px",borderRadius:4,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>삭제</button>
                                )
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ③ 출석 현황 */}
            <SectionTitle>✅ 출석 현황</SectionTitle>
            <div style={{marginBottom:20}}>
              {myAtt.length===0?(
                <div style={{color:"#888780",fontSize:13}}>출석 기록이 없어요</div>
              ):(
                <>
                  <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:8}}>
                    {myAtt.slice(0,30).map((r,i)=>(
                      <div key={i} style={{width:28,height:28,borderRadius:6,background:r.status==="O"?"#EAF3DE":r.status==="L"?"#FAEEDA":"#FCEBEB",color:r.status==="O"?"#27500A":r.status==="L"?"#633806":"#791F1F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:500}}>
                        {r.status==="O"?"O":r.status==="L"?"지":"X"}
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:12,fontSize:12,color:"#888780"}}>
                    <span>출석 <b style={{color:"#27500A"}}>{attCount}</b>회</span>
                    <span>결석 <b style={{color:"#E24B4A"}}>{myAtt.filter(r=>r.status==="X").length}</b>회</span>
                    <span>지각 <b style={{color:"#BA7517"}}>{lateCount}</b>회</span>
                    <span>공결 <b>{myAtt.filter(r=>r.status==="E").length}</b>회</span>
                  </div>
                </>
              )}
            </div>

            {/* ④ 단어시험 */}
            <SectionTitle>📝 단어시험 점수 추이</SectionTitle>
            <div style={{marginBottom:20}}>
              {myScores.length===0?(
                <div style={{color:"#888780",fontSize:13}}>점수 기록이 없어요</div>
              ):myScores.map((r,i)=>{
                const col=r.score>=85?"#639922":r.score>=70?"#BA7517":"#E24B4A";
                return(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,cursor:"pointer"}} onClick={()=>openScoreStats(r.week)}>
                    <span style={{fontSize:11,color:"#888780",width:80,flexShrink:0}}>{r.week}</span>
                    <div style={{flex:1,background:"#F1EFE8",borderRadius:99,height:8,overflow:"hidden"}}>
                      <div style={{width:r.score+"%",height:"100%",background:col,borderRadius:99}}/>
                    </div>
                    <span style={{fontSize:12,fontWeight:500,color:col,width:40,textAlign:"right"}}>{r.score}점</span>
                    <Badge label={r.pass?"합격":"불합격"} type={r.pass?"green":"red"}/>
                    <span style={{fontSize:10,color:"#888780"}}>📊</span>
                  </div>
                );
              })}
              {myScores.length>0&&<div style={{fontSize:11,color:"#888780",marginTop:4}}>📊 클릭하면 전체 통계를 볼 수 있어요</div>}
            </div>

            {/* ⑤ OMR */}
            <SectionTitle>📋 OMR 채점 기록</SectionTitle>
            <div style={{marginBottom:20}}>
              {omrData.length===0?(
                <div style={{color:"#888780",fontSize:13}}>채점 기록이 없어요</div>
              ):(
                <div style={{border:"0.5px solid #D3D1C7",borderRadius:8,overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                    <thead><tr style={{background:"#F1EFE8"}}>
                      {["시험명","날짜","점수","등급","오답"].map((h,i)=><th key={i} style={{padding:"7px 10px",textAlign:"left",fontSize:11,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {omrData.map(r=>{
                        const p=r.score;
                        const g=p>=90?"A":p>=80?"B":p>=70?"C":p>=60?"D":"F";
                        const gType=p>=90?"green":p>=80?"blue":p>=70?"amber":"red";
                        return(
                          <tr key={r.id} style={{borderBottom:"0.5px solid #F1EFE8",cursor:"pointer"}}
                            onClick={()=>openStats(r.answer_key_id)}
                            onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"}
                            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            <td style={{padding:"7px 10px",fontWeight:500}}>{r.title||r.week} <span style={{fontSize:10,color:"#888780"}}>📊</span></td>
                            <td style={{padding:"7px 10px",color:"#888780",fontSize:12}}>{r.test_date}</td>
                            <td style={{padding:"7px 10px",fontWeight:500,color:p>=70?"#27500A":"#E24B4A"}}>{p}점</td>
                            <td style={{padding:"7px 10px"}}><Badge label={g} type={gType}/></td>
                            <td style={{padding:"7px 10px",color:"#888780",fontSize:12}}>{r.wrong?.length||0}개</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ⑥ 클리닉 */}
            <SectionTitle>🗓️ 클리닉 신청 내역</SectionTitle>
            <div style={{marginBottom:20}}>
              {clinicData.length===0?(
                <div style={{color:"#888780",fontSize:13}}>클리닉 신청 내역이 없어요</div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {clinicData.map(r=>(
                    <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#F1EFE8",borderRadius:8,flexWrap:"wrap"}}>
                      <span style={{fontSize:13,fontWeight:500,color:"#2C2C2A"}}>{r.date}</span>
                      <span style={{fontSize:12,color:"#888780"}}>{r.time}</span>
                      {r.reason&&r.reason!=="(사유 없음)"&&<span style={{fontSize:12,color:"#5F5E5A",flex:1}}>{r.reason}</span>}
                      <Badge label={{pending:"대기 중",confirmed:"확정",cancelled:"취소"}[r.status]||r.status} type={{pending:"amber",confirmed:"green",cancelled:"red"}[r.status]||"gray"}/>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ⑦ 강사 코멘트 */}
            <SectionTitle>💬 담임 강사 코멘트</SectionTitle>
            <textarea value={comment} onChange={e=>setComment(e.target.value)}
              placeholder="이 학생에 대한 코멘트를 입력하세요..."
              rows={4}
              style={{width:"100%",fontSize:13,padding:"10px 12px",borderRadius:8,border:"0.5px solid #D3D1C7",resize:"vertical",boxSizing:"border-box",lineHeight:1.7,marginBottom:8}}/>
            <div style={{fontSize:12,color:"#888780",textAlign:"right"}}>English Academy 담당 강사 드림</div>
          </div>
        </div>
      )}
    </div>
  );
}


// ════════════════════════════════════════════════
// 학생 포인트 현황 카드 (홈 화면)
// ════════════════════════════════════════════════
// ════════════════════════════════════════════════
// 명예의 전당 자동 슬라이더 (4개씩, 3초마다 전환)
// ════════════════════════════════════════════════
function HallOfFameSlider({hallOfFame}){
  const [pageA,setPageA] = useState(0); // 재학생 페이지
  const [pageB,setPageB] = useState(0); // 졸업생 페이지
  const perPage = 4;

  const listA = hallOfFame.filter(h=>(h.student_type||"재학생")==="재학생");
  const listB = hallOfFame.filter(h=>(h.student_type||"재학생")==="졸업생");
  const totalA = Math.max(1, Math.ceil(listA.length/perPage));
  const totalB = Math.max(1, Math.ceil(listB.length/perPage));

  // 자동 슬라이드
  useEffect(()=>{
    if(totalA<=1) return;
    const t=setInterval(()=>setPageA(p=>(p+1)%totalA),3000);
    return ()=>clearInterval(t);
  },[totalA]);
  useEffect(()=>{
    if(totalB<=1) return;
    const t=setInterval(()=>setPageB(p=>(p+1)%totalB),3500);
    return ()=>clearInterval(t);
  },[totalB]);

  const itemsA = listA.slice(pageA*perPage,(pageA+1)*perPage);
  const itemsB = listB.slice(pageB*perPage,(pageB+1)*perPage);

  const achColor={"1등급":"#EF9F27","성적 향상":"#185FA5","개근":"#27500A","우수":"#3C3489","수능":"#791F1F"};
  const achBg   ={"1등급":"#FAEEDA","성적 향상":"#E6F1FB","개근":"#EAF3DE","우수":"#EEEDFE","수능":"#FCEBEB"};
  const getColor=(ach)=>{
    for(const k of Object.keys(achColor)) if(ach?.includes(k)) return{c:achColor[k],bg:achBg[k]};
    return{c:"#888780",bg:"#F1EFE8"};
  };
  const getEmoji=(ach)=>ach?.includes("1등급")||ach?.includes("수능")?"🥇":ach?.includes("성적")?"📈":ach?.includes("개근")?"📅":"⭐";

  const Section=({title,icon,items,page,setPage,total,list})=>(
    <div style={{marginBottom:list===listB?0:16}}>
      {/* 섹션 헤더 */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:14}}>{icon}</span>
          <span style={{fontSize:13,fontWeight:600,color:"#2C2C2A"}}>{title}</span>
          <span style={{fontSize:11,color:"#888780"}}>({list.length}명)</span>
        </div>
        {total>1&&(
          <div style={{display:"flex",gap:3}}>
            {Array.from({length:total}).map((_,i)=>(
              <div key={i} onClick={()=>setPage(i)}
                style={{width:i===page?14:5,height:5,borderRadius:99,background:i===page?"#3C3489":"#D3D1C7",cursor:"pointer",transition:"width 0.3s"}}/>
            ))}
          </div>
        )}
      </div>
      {/* 카드 그리드 */}
      {items.length===0?(
        <div style={{textAlign:"center",padding:"14px",color:"#888780",fontSize:12,background:"#F8F7F4",borderRadius:10}}>
          아직 등록된 학생이 없어요
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {items.map((h,i)=>{
            const{c,bg}=getColor(h.achievement);
            return(
              <div key={h.id||i} style={{background:bg,borderRadius:12,padding:"11px 13px",border:`0.5px solid ${c}25`}}>
                <div style={{fontSize:11,fontWeight:600,color:c,marginBottom:3}}>{getEmoji(h.achievement)} {h.achievement}</div>
                <div style={{fontSize:13,fontWeight:700,color:"#2C2C2A"}}>{h.name}</div>
                {h.school&&<div style={{fontSize:10,color:"#888780",marginTop:1}}>{h.school}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return(
    <div style={{background:"white",borderRadius:16,padding:"16px 18px",marginBottom:12,border:"0.5px solid #E8E6E0",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
      <div style={{fontSize:15,fontWeight:600,color:"#2C2C2A",marginBottom:14}}>🏆 명예의 전당</div>

      {/* 재학생 섹션 */}
      <Section title="재학생" icon="🎒" items={itemsA} page={pageA} setPage={setPageA} total={totalA} list={listA}/>

      {/* 구분선 */}
      <div style={{borderTop:"0.5px solid #F1EFE8",margin:"14px 0"}}/>

      {/* 졸업생 섹션 */}
      <Section title="졸업생" icon="🎓" items={itemsB} page={pageB} setPage={setPageB} total={totalB} list={listB}/>

      <div style={{fontSize:11,color:"#888780",marginTop:12,textAlign:"center"}}>명예의 전당 등재 시 300P 지급!</div>
    </div>
  );
}

// ════════════════════════════════════════════════
// 최근 Q&A 미니 배너
// ════════════════════════════════════════════════
function RecentQnaBanner({student}){
  const [items,setItems] = useState([]);
  useEffect(()=>{
    supabase.from("questions").select("id,title,answer,category,created_at")
      .eq("student_id",student.id).order("created_at",{ascending:false}).limit(3)
      .then(({data})=>setItems(data||[]));
  },[student.id]);
  if(items.length===0) return(
    <div style={{textAlign:"center",padding:"12px 0",color:"#888780",fontSize:13}}>아직 질문이 없어요</div>
  );
  return(
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {items.map(q=>(
        <div key={q.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"#F8F7F4",borderRadius:10}}>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:500,color:"#2C2C2A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.title}</div>
            <div style={{fontSize:10,color:"#888780",marginTop:2}}>{q.created_at?.split("T")[0]}</div>
          </div>
          {q.answer
            ?<span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:"#EAF3DE",color:"#27500A",fontWeight:500,flexShrink:0}}>답변 완료</span>
            :<span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:"#FAEEDA",color:"#633806",fontWeight:500,flexShrink:0}}>대기 중</span>
          }
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════
// 리뷰 전체 화면 (학생용)
// ════════════════════════════════════════════════
function StudentReviewPage({student,onBack}){
  const [allReviews,setAllReviews] = useState([]);
  const [myReview,setMyReview]     = useState(null);
  const [form,setForm]             = useState({rating:5,content:""});
  const [showForm,setShowForm]     = useState(false);
  const [successMsg,setSuccessMsg] = useState("");
  const [tab,setTab]               = useState("board"); // board | write
  const [loading,setLoading]       = useState(true);
  const [expanded,setExpanded]     = useState(false);

  const load=async()=>{
    const [{data:approved},{data:mine}]=await Promise.all([
      supabase.from("reviews").select("*").eq("status","approved").order("approved_at",{ascending:false}),
      supabase.from("reviews").select("*").eq("student_id",student.id).order("created_at",{ascending:false}),
    ]);
    setAllReviews(approved||[]);
    setMyReview((mine||[])[0]||null);
    setLoading(false);
  };
  useEffect(()=>{load();},[student.id]);

  const submit=async()=>{
    if(!form.content.trim()){alert("리뷰 내용을 입력해주세요.");return;}
    const payload={student_id:student.id,student_name:student.name,cls:student.cls,rating:form.rating,content:form.content,status:"pending"};
    const isFirst=!myReview||myReview.status==="rejected";
    if(myReview&&myReview.status==="pending"){
      await supabase.from("reviews").update({rating:form.rating,content:form.content}).eq("id",myReview.id);
    } else {
      await supabase.from("reviews").insert(payload);
    }
    await load();
    setShowForm(false);
    setTab("board");
    setSuccessMsg("리뷰가 제출됐어요! 선생님 승인 후 게시판에 공개돼요 😊");
    setTimeout(()=>setSuccessMsg(""),4000);
  };

  const stars=(n,interactive=false,size=18)=>[1,2,3,4,5].map(i=>(
    <span key={i}
      onClick={interactive?()=>setForm({...form,rating:i}):undefined}
      style={{fontSize:size,color:i<=n?"#EF9F27":"#D3D1C7",cursor:interactive?"pointer":"default"}}>★</span>
  ));

  const avg=allReviews.length>0?(allReviews.reduce((a,b)=>a+b.rating,0)/allReviews.length).toFixed(1):"—";
  const displayed=expanded?allReviews:allReviews.slice(0,5);

  return(
    <div style={{minHeight:"100vh",background:"#F1EFE8",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      {/* 헤더 */}
      <div style={{background:"#185FA5",padding:"0 16px",height:52,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{color:"#85B7EB",background:"transparent",border:"none",cursor:"pointer",fontSize:20,lineHeight:1}}>←</button>
        <span style={{color:"#E6F1FB",fontWeight:500,fontSize:15}}>수강생 리뷰</span>
      </div>

      <div style={{padding:"16px"}}>
        <SuccessBox msg={successMsg}/>

        {/* 탭 */}
        <div style={{display:"flex",gap:4,marginBottom:16}}>
          {[["board","📋 전체 리뷰"],["write","✏️ 리뷰 작성"]].map(([id,label])=>(
            <button key={id} onClick={()=>{setTab(id);if(id==="write")setShowForm(true);}}
              style={{fontSize:13,padding:"7px 18px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:tab===id?"#185FA5":"#D3D1C7",background:tab===id?"#185FA5":"white",color:tab===id?"white":"#888780",fontWeight:tab===id?500:400}}>
              {label}
            </button>
          ))}
        </div>

        {/* ── 전체 리뷰 게시판 ── */}
        {tab==="board"&&(
          <div>
            {loading?(
              <div style={{textAlign:"center",padding:"3rem",color:"#888780"}}>불러오는 중...</div>
            ):(
              <>
                {/* 평균 별점 */}
                {allReviews.length>0&&(
                  <div style={{background:"white",borderRadius:12,border:"0.5px solid #D3D1C7",padding:"1.25rem",textAlign:"center",marginBottom:16}}>
                    <div style={{fontSize:48,fontWeight:500,color:"#2C2C2A",lineHeight:1}}>{avg}</div>
                    <div style={{margin:"8px 0"}}>{stars(Math.round(parseFloat(avg)),false,22)}</div>
                    <div style={{fontSize:12,color:"#888780"}}>총 {allReviews.length}개 리뷰</div>
                  </div>
                )}

                {/* 리뷰 목록 */}
                {allReviews.length===0?(
                  <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13,background:"white",borderRadius:12,border:"0.5px solid #D3D1C7"}}>
                    아직 승인된 리뷰가 없어요
                  </div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {displayed.map(r=>(
                      <div key={r.id} style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:12,padding:"1rem 1.25rem"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                          <div style={{width:34,height:34,borderRadius:"50%",background:AVATAR_COLORS[r.student_id%AVATAR_COLORS.length].bg,color:AVATAR_COLORS[r.student_id%AVATAR_COLORS.length].c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:500,flexShrink:0}}>
                            {r.student_name?.slice(0,2)}
                          </div>
                          <div>
                            <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A"}}>{r.student_name}</div>
                            <div style={{fontSize:10,color:"#888780"}}>{r.approved_at?.split("T")[0]}</div>
                          </div>
                          <div style={{marginLeft:"auto"}}>{stars(r.rating,false,14)}</div>
                        </div>
                        <div style={{fontSize:13,color:"#5F5E5A",lineHeight:1.8}}>{r.content}</div>
                      </div>
                    ))}
                    {allReviews.length>5&&(
                      <button onClick={()=>setExpanded(!expanded)}
                        style={{width:"100%",fontSize:12,color:"#888780",background:"white",border:"0.5px solid #D3D1C7",borderRadius:8,padding:"8px",cursor:"pointer"}}>
                        {expanded?`▲ 접기`:`▼ 더 보기 (${allReviews.length-5}개 더)`}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── 리뷰 작성 ── */}
        {tab==="write"&&(
          <div>
            {/* 내 리뷰 상태 */}
            {myReview&&(
              <div style={{background:myReview.status==="approved"?"#EAF3DE":myReview.status==="pending"?"#FAEEDA":"#FCEBEB",border:`0.5px solid ${myReview.status==="approved"?"#97C459":myReview.status==="pending"?"#EF9F27":"#F09595"}`,borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:12}}>
                {myReview.status==="approved"&&<><b style={{color:"#27500A"}}>✅ 내 리뷰가 게시판에 공개됐어요!</b><div style={{color:"#888780",marginTop:4}}>새 리뷰를 추가로 작성할 수 있어요.</div></>}
                {myReview.status==="pending"&&<><b style={{color:"#633806"}}>⏳ 작성한 리뷰가 승인 대기 중이에요</b><div style={{color:"#888780",marginTop:4}}>내용을 수정하거나 새로 작성할 수 있어요.</div></>}
                {myReview.status==="rejected"&&<><b style={{color:"#791F1F"}}>✕ 리뷰가 반려됐어요</b><div style={{color:"#888780",marginTop:4}}>다시 작성해주세요.</div></>}
              </div>
            )}

            {/* 포인트 안내 */}
            <div style={{background:"linear-gradient(135deg,#FFF8E1,#FFF3CD)",border:"0.5px solid #EF9F27",borderRadius:10,padding:"12px 16px",marginBottom:16,textAlign:"center"}}>
              <div style={{fontSize:13,fontWeight:500,color:"#633806"}}>🎁 리뷰 작성 시 200p 지급!</div>
              <div style={{fontSize:12,color:"#BA7517",marginTop:2}}>베스트 선정 시 500p 추가!</div>
            </div>

            {/* 작성 폼 */}
            <div style={{background:"white",borderRadius:12,border:"0.5px solid #D3D1C7",padding:"1.25rem"}}>
              <div style={{fontSize:14,fontWeight:500,color:"#2C2C2A",marginBottom:14}}>리뷰 작성</div>
              {/* 별점 */}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:12,color:"#888780",marginBottom:6}}>별점</div>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  {stars(form.rating,true,28)}
                  <span style={{fontSize:13,color:"#888780",marginLeft:6}}>{form.rating}점</span>
                </div>
              </div>
              {/* 내용 */}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:12,color:"#888780",marginBottom:6}}>내용</div>
                <textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})}
                  placeholder="수업에 대한 솔직한 후기를 남겨주세요! 선생님이 검토 후 게시판에 올려드릴게요 😊"
                  rows={6} style={{width:"100%",fontSize:13,padding:"10px 12px",borderRadius:8,border:"0.5px solid #D3D1C7",resize:"vertical",boxSizing:"border-box",lineHeight:1.7}}/>
              </div>
              <BtnPrimary onClick={submit} style={{width:"100%",padding:"12px"}}>제출하기</BtnPrimary>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// 리뷰 배너 카드 (홈 화면용 — 버튼 클릭 시 전체 화면 전환)
// ════════════════════════════════════════════════
function StudentPointCard({student, onGoToReview}){
  const [myReview,setMyReview] = useState(null);

  useEffect(()=>{
    supabase.from("reviews").select("status").eq("student_id",student.id)
      .order("created_at",{ascending:false}).limit(1)
      .then(({data})=>setMyReview(data?.[0]||null));
  },[student.id]);

  const isPending  = myReview?.status==="pending";
  const isApproved = myReview?.status==="approved";

  return(
    <div style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden",marginBottom:16}}>
      <div style={{padding:"20px 16px",textAlign:"center"}}>
        <div style={{fontSize:14,fontWeight:500,color:"#633806",marginBottom:4}}>
          🎁 리뷰 작성 시 200p 지급!
        </div>
        <div style={{fontSize:13,color:"#BA7517",marginBottom:16}}>
          베스트 선정 시 500p 추가!
        </div>
        {isApproved&&(
          <div style={{fontSize:12,color:"#27500A",background:"#EAF3DE",borderRadius:8,padding:"5px 12px",marginBottom:12,display:"inline-block"}}>
            ✅ 내 리뷰가 게시판에 공개됐어요!
          </div>
        )}
        {isPending&&(
          <div style={{fontSize:12,color:"#633806",background:"#FAEEDA",borderRadius:8,padding:"5px 12px",marginBottom:12,display:"inline-block"}}>
            ⏳ 리뷰 승인 대기 중
          </div>
        )}
        <button onClick={onGoToReview}
          style={{fontSize:14,fontWeight:500,padding:"11px 32px",borderRadius:99,border:"none",background:"#EF9F27",color:"white",cursor:"pointer",boxShadow:"0 2px 8px rgba(239,159,39,0.35)"}}>
          ✏️ 리뷰 작성하기
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
function StudentReviewBoard({student}){
  const [reviews,setReviews]         = useState([]);
  const [myReview,setMyReview]       = useState(null);
  const [showForm,setShowForm]       = useState(false);
  const [form,setForm]               = useState({rating:5,content:""});
  const [successMsg,setSuccessMsg]   = useState("");
  const [expanded,setExpanded]       = useState(false);

  const load=async()=>{
    const [{data:approved},{data:mine}]=await Promise.all([
      supabase.from("reviews").select("*").eq("status","approved").order("approved_at",{ascending:false}),
      supabase.from("reviews").select("*").eq("student_id",student.id).order("created_at",{ascending:false}),
    ]);
    setReviews(approved||[]);
    setMyReview((mine||[])[0]||null);
  };
  useEffect(()=>{load();},[student.id]);

  const submit=async()=>{
    if(!form.content.trim()){alert("리뷰 내용을 입력해주세요.");return;}
    if(myReview&&myReview.status==="approved"){alert("이미 승인된 리뷰는 수정할 수 없어요.");return;}
    const payload={student_id:student.id,student_name:student.name,cls:student.cls,rating:form.rating,content:form.content,status:"pending"};
    if(myReview&&myReview.status==="pending"){
      await supabase.from("reviews").update({rating:form.rating,content:form.content}).eq("id",myReview.id);
    } else {
      await supabase.from("reviews").insert(payload);
    }
    await load();
    setShowForm(false);
    setSuccessMsg("리뷰가 제출됐어요! 선생님 승인 후 공개돼요 😊");
    setTimeout(()=>setSuccessMsg(""),4000);
  };

  const stars=(n,size=14)=>[1,2,3,4,5].map(i=>(
    <span key={i} style={{fontSize:size,color:i<=n?"#EF9F27":"#D3D1C7"}}>★</span>
  ));

  const avgRating = reviews.length>0?(reviews.reduce((a,b)=>a+b.rating,0)/reviews.length).toFixed(1):"—";
  const displayed = expanded ? reviews : reviews.slice(0,3);

  return(
    <div style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden",marginBottom:16}}>
      {/* 헤더 */}
      <div style={{background:"#185FA5",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>⭐</span>
          <div>
            <div style={{fontSize:15,fontWeight:500,color:"white"}}>수강생 리뷰</div>
            <div style={{fontSize:11,color:"#85B7EB",marginTop:1}}>{reviews.length}개 리뷰 · 평균 {avgRating}점</div>
          </div>
        </div>
        {/* 내 리뷰 상태 */}
        {myReview&&(
          <div style={{fontSize:11,padding:"3px 10px",borderRadius:99,background:myReview.status==="approved"?"#EAF3DE":myReview.status==="pending"?"#FAEEDA":"#FCEBEB",color:myReview.status==="approved"?"#27500A":myReview.status==="pending"?"#633806":"#791F1F",fontWeight:500}}>
            {myReview.status==="approved"?"내 리뷰 공개됨":myReview.status==="pending"?"내 리뷰 대기 중":"내 리뷰 반려됨"}
          </div>
        )}
      </div>

      <div style={{padding:"12px 16px"}}>
        <SuccessBox msg={successMsg}/>

        {/* 포인트 혜택 문구 + 리뷰 작성 버튼 */}
        {(!myReview||myReview.status==="rejected")&&!showForm&&(
          <div style={{textAlign:"center",background:"linear-gradient(135deg,#FFF8E1,#FFF3CD)",border:"0.5px solid #EF9F27",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:500,color:"#633806",marginBottom:2}}>🎁 후기 작성 시 200p 지급!</div>
            <div style={{fontSize:12,color:"#BA7517",marginBottom:12}}>베스트 선정 시 500p 추가!</div>
            <button onClick={()=>{setForm({rating:5,content:""});setShowForm(true);}}
              style={{fontSize:13,fontWeight:500,padding:"10px 28px",borderRadius:99,border:"none",background:"#EF9F27",color:"white",cursor:"pointer",boxShadow:"0 2px 8px rgba(239,159,39,0.3)"}}>
              ✏️ 리뷰 작성하기
            </button>
          </div>
        )}

        {/* 대기 중인 내 리뷰 — 수정 버튼 */}
        {myReview&&myReview.status==="pending"&&!showForm&&(
          <div style={{textAlign:"center",background:"#FAEEDA",border:"0.5px solid #EF9F27",borderRadius:10,padding:"10px 16px",marginBottom:12}}>
            <div style={{fontSize:12,color:"#633806",marginBottom:8}}>리뷰가 선생님 승인 대기 중이에요 ⏳</div>
            <button onClick={()=>{setForm({rating:myReview.rating,content:myReview.content});setShowForm(true);}}
              style={{fontSize:12,padding:"6px 16px",borderRadius:99,border:"0.5px solid #EF9F27",background:"white",color:"#BA7517",cursor:"pointer"}}>
              수정하기
            </button>
          </div>
        )}

        {/* 승인된 리뷰 목록 */}
        {reviews.length===0?(
          <div style={{textAlign:"center",padding:"1rem 0",color:"#888780",fontSize:13}}>아직 등록된 리뷰가 없어요</div>
        ):(
          <>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:8}}>
              {displayed.map(r=>(
                <div key={r.id} style={{background:"#F1EFE8",borderRadius:8,padding:"10px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{width:26,height:26,borderRadius:"50%",background:AVATAR_COLORS[r.student_id%AVATAR_COLORS.length].bg,color:AVATAR_COLORS[r.student_id%AVATAR_COLORS.length].c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:500,flexShrink:0}}>{r.student_name?.slice(0,2)}</div>
                    <span style={{fontSize:12,fontWeight:500,color:"#2C2C2A"}}>{r.student_name}</span>
                    <div style={{marginLeft:"auto"}}>{stars(r.rating,12)}</div>
                  </div>
                  <div style={{fontSize:12,color:"#5F5E5A",lineHeight:1.7}}>{r.content}</div>
                </div>
              ))}
            </div>
            {reviews.length>3&&(
              <button onClick={()=>setExpanded(!expanded)}
                style={{width:"100%",fontSize:12,color:"#888780",background:"transparent",border:"0.5px solid #D3D1C7",borderRadius:8,padding:"6px",cursor:"pointer",marginBottom:8}}>
                {expanded?`▲ 접기`:`▼ 더 보기 (${reviews.length-3}개 더)`}
              </button>
            )}
          </>
        )}

        {showForm&&(
          <div style={{background:"#F1EFE8",borderRadius:8,padding:"12px",marginTop:4}}>
            <div style={{fontSize:12,fontWeight:500,color:"#2C2C2A",marginBottom:10}}>리뷰 작성</div>
            {/* 별점 */}
            <div style={{display:"flex",gap:4,marginBottom:10}}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>setForm({...form,rating:n})}
                  style={{fontSize:24,background:"transparent",border:"none",cursor:"pointer",color:n<=form.rating?"#EF9F27":"#D3D1C7",padding:0}}>★</button>
              ))}
              <span style={{fontSize:12,color:"#888780",alignSelf:"center",marginLeft:4}}>{form.rating}점</span>
            </div>
            <textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})}
              placeholder="수업에 대한 솔직한 후기를 남겨주세요!"
              rows={3} style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",resize:"none",boxSizing:"border-box",marginBottom:8}}/>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <BtnSecondary onClick={()=>setShowForm(false)}>취소</BtnSecondary>
              <BtnPrimary onClick={submit}>제출하기</BtnPrimary>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// 학생 리뷰 (내 리뷰 탭 — 현재 미사용, 보존)
// ════════════════════════════════════════════════
function StudentReview({student}){
  const [allReviews,setAllReviews]   = useState([]); // 승인된 전체 리뷰
  const [myReview,setMyReview]       = useState(null); // 내 리뷰 (최신)
  const [loading,setLoading]         = useState(true);
  const [showForm,setShowForm]       = useState(false);
  const [form,setForm]               = useState({rating:5,content:""});
  const [successMsg,setSuccessMsg]   = useState("");
  const [tab,setTab]                 = useState("board"); // "board"|"mine"

  const load=async()=>{
    const [{data:approved},{data:mine}]=await Promise.all([
      supabase.from("reviews").select("*").eq("status","approved").order("approved_at",{ascending:false}),
      supabase.from("reviews").select("*").eq("student_id",student.id).order("created_at",{ascending:false}),
    ]);
    setAllReviews(approved||[]);
    setMyReview((mine||[])[0]||null);
    setLoading(false);
  };
  useEffect(()=>{load();},[student.id]);

  const submit=async()=>{
    if(!form.content.trim()){alert("리뷰 내용을 입력해주세요.");return;}
    if(myReview&&myReview.status==="approved"){alert("이미 승인된 리뷰는 수정할 수 없어요.\n새 리뷰를 작성하려면 기존 리뷰가 거절되어야 해요.");return;}
    const payload={
      student_id:student.id, student_name:student.name, cls:student.cls,
      rating:form.rating, content:form.content, status:"pending",
    };
    if(myReview&&myReview.status==="pending"){
      // 수정 (대기 중인 것만)
      const {error}=await supabase.from("reviews").update({rating:form.rating,content:form.content}).eq("id",myReview.id);
      if(error){alert("오류가 발생했습니다.");return;}
    } else {
      const {error}=await supabase.from("reviews").insert(payload);
      if(error){alert("오류가 발생했습니다.");return;}
    }
    await load();
    setShowForm(false);
    setSuccessMsg("리뷰가 제출됐어요! 선생님 승인 후 전체 게시판에 공유돼요 😊");
    setTimeout(()=>setSuccessMsg(""),4000);
  };

  const stars=(n,size=18)=>[1,2,3,4,5].map(i=>(
    <span key={i} style={{fontSize:size,color:i<=n?"#EF9F27":"#D3D1C7"}}>★</span>
  ));

  const statusInfo={
    pending:{label:"승인 대기",color:"#BA7517",bg:"#FAEEDA",desc:"선생님이 검토 중이에요"},
    approved:{label:"승인됨",color:"#27500A",bg:"#EAF3DE",desc:"전체 게시판에 공개됐어요 🎉"},
    rejected:{label:"반려됨",color:"#791F1F",bg:"#FCEBEB",desc:"선생님이 반려했어요. 다시 작성할 수 있어요"},
  };

  if(loading) return <div style={{textAlign:"center",padding:"2rem",color:"#888780",fontSize:13}}>불러오는 중...</div>;

  return(
    <div>
      <SuccessBox msg={successMsg}/>

      {/* 탭 */}
      <div style={{display:"flex",gap:4,marginBottom:16}}>
        {[["board","전체 리뷰 게시판"],["mine","내 리뷰"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{fontSize:12,padding:"5px 14px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:tab===id?"#888780":"#D3D1C7",background:tab===id?"#F1EFE8":"transparent",color:tab===id?"#2C2C2A":"#888780",fontWeight:tab===id?500:400}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── 전체 리뷰 게시판 ── */}
      {tab==="board"&&(
        <div>
          {allReviews.length===0?(
            <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13,background:"white",borderRadius:12,border:"0.5px solid #D3D1C7"}}>
              아직 승인된 리뷰가 없어요
            </div>
          ):(
            <>
              {/* 평균 별점 */}
              <div style={{background:"white",borderRadius:12,border:"0.5px solid #D3D1C7",padding:"1.25rem",marginBottom:16,textAlign:"center"}}>
                <div style={{fontSize:40,fontWeight:500,color:"#2C2C2A",lineHeight:1}}>
                  {(allReviews.reduce((a,b)=>a+b.rating,0)/allReviews.length).toFixed(1)}
                </div>
                <div style={{margin:"6px 0"}}>{stars(Math.round(allReviews.reduce((a,b)=>a+b.rating,0)/allReviews.length),20)}</div>
                <div style={{fontSize:12,color:"#888780"}}>총 {allReviews.length}개 리뷰</div>
              </div>
              {/* 리뷰 카드 목록 */}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {allReviews.map(r=>(
                  <div key={r.id} style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:12,padding:"1rem 1.25rem"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:AVATAR_COLORS[r.student_id%AVATAR_COLORS.length].bg,color:AVATAR_COLORS[r.student_id%AVATAR_COLORS.length].c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:500,flexShrink:0}}>{r.student_name?.slice(0,2)}</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A"}}>{r.student_name}</div>
                        <div style={{fontSize:10,color:"#888780"}}>{r.approved_at?.split("T")[0]}</div>
                      </div>
                      <div style={{marginLeft:"auto"}}>{stars(r.rating,14)}</div>
                    </div>
                    <div style={{fontSize:13,color:"#5F5E5A",lineHeight:1.7}}>{r.content}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── 내 리뷰 ── */}
      {tab==="mine"&&(
        <div>
          {/* 내 리뷰 현황 */}
          {myReview&&(
            <div style={{background:"white",border:`0.5px solid ${statusInfo[myReview.status]?.color||"#D3D1C7"}`,borderRadius:12,padding:"1rem 1.25rem",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div>{stars(myReview.rating,16)}</div>
                <div style={{fontSize:12,padding:"3px 10px",borderRadius:99,background:statusInfo[myReview.status]?.bg,color:statusInfo[myReview.status]?.color,fontWeight:500}}>
                  {statusInfo[myReview.status]?.label}
                </div>
              </div>
              <div style={{fontSize:13,color:"#5F5E5A",lineHeight:1.7,marginBottom:8}}>{myReview.content}</div>
              <div style={{fontSize:11,color:"#888780"}}>{statusInfo[myReview.status]?.desc}</div>
              {myReview.status==="pending"&&(
                <button onClick={()=>{setForm({rating:myReview.rating,content:myReview.content});setShowForm(true);}}
                  style={{marginTop:10,fontSize:12,padding:"5px 12px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>
                  수정하기
                </button>
              )}
            </div>
          )}

          {/* 리뷰 작성 폼 */}
          {(!myReview||myReview.status==="rejected")&&!showForm&&(
            <BtnPrimary onClick={()=>{setForm({rating:5,content:""});setShowForm(true);}}>
              ⭐ 리뷰 작성하기
            </BtnPrimary>
          )}

          {showForm&&(myReview?.status!=="approved")&&(
            <Card mb={0}>
              <SectionTitle>{myReview&&myReview.status==="pending"?"리뷰 수정":"리뷰 작성"}</SectionTitle>
              {/* 별점 */}
              <div style={{marginBottom:12}}>
                <div style={{fontSize:12,color:"#888780",marginBottom:6}}>별점</div>
                <div style={{display:"flex",gap:6}}>
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>setForm({...form,rating:n})}
                      style={{fontSize:28,background:"transparent",border:"none",cursor:"pointer",color:n<=form.rating?"#EF9F27":"#D3D1C7",padding:2}}>
                      ★
                    </button>
                  ))}
                  <span style={{fontSize:13,color:"#888780",alignSelf:"center",marginLeft:4}}>{form.rating}점</span>
                </div>
              </div>
              {/* 내용 */}
              <div style={{marginBottom:12}}>
                <div style={{fontSize:12,color:"#888780",marginBottom:6}}>리뷰 내용</div>
                <textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})}
                  placeholder="수업에 대한 솔직한 후기를 남겨주세요! 선생님이 검토 후 게시판에 올려드릴게요 😊"
                  rows={5} style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",resize:"vertical",boxSizing:"border-box"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
                <BtnSecondary onClick={()=>setShowForm(false)}>취소</BtnSecondary>
                <BtnPrimary onClick={submit}>제출하기</BtnPrimary>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function TeacherReviews(){
  const [reviews,setReviews]         = useState([]);
  const [loading,setLoading]         = useState(true);
  const [filterStatus,setFilterStatus] = useState("pending");
  const [successMsg,setSuccessMsg]   = useState("");

  const load=async()=>{
    const {data}=await supabase.from("reviews").select("*").order("created_at",{ascending:false});
    setReviews(data||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  // 실시간 구독
  useEffect(()=>{
    const ch=supabase.channel("reviews_ch")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"reviews"},()=>load())
      .subscribe();
    return ()=>supabase.removeChannel(ch);
  },[]);

  const approve=async(r)=>{
    const {error}=await supabase.from("reviews").update({status:"approved",approved_at:new Date().toISOString()}).eq("id",r.id);
    if(error){alert("오류가 발생했습니다.");return;}
    await supabase.from("points").insert({
      student_id:r.student_id, student_name:r.student_name, cls:r.cls,
      amount:200, reason:"수업 리뷰 작성", category:"참여",
    });
    await addXp(r.student_id, 200);
    setReviews(prev=>prev.map(x=>x.id===r.id?{...x,status:"approved",approved_at:new Date().toISOString()}:x));
    setSuccessMsg(`"${r.student_name}"의 리뷰가 승인됐어요! 200P + 200XP 지급됐어요 🎉`);
    setTimeout(()=>setSuccessMsg(""),4000);
  };

  const grantBest=async(r)=>{
    await supabase.from("points").insert({
      student_id:r.student_id, student_name:r.student_name, cls:r.cls,
      amount:500, reason:"베스트 리뷰 선정", category:"참여",
    });
    await addXp(r.student_id, 500);
    setSuccessMsg(`"${r.student_name}" 베스트 리뷰 선정! 500P + 500XP 추가 지급됐어요 👑`);
    setTimeout(()=>setSuccessMsg(""),4000);
  };

  const reject=async(r)=>{
    const {error}=await supabase.from("reviews").update({status:"rejected"}).eq("id",r.id);
    if(error){alert("오류가 발생했습니다.");return;}
    setReviews(prev=>prev.map(x=>x.id===r.id?{...x,status:"rejected"}:x));
    setSuccessMsg("리뷰가 반려됐어요.");
    setTimeout(()=>setSuccessMsg(""),3000);
  };

  const deleteR=async(id)=>{
    if(!window.confirm("이 리뷰를 삭제할까요?"))return;
    await supabase.from("reviews").delete().eq("id",id);
    setReviews(prev=>prev.filter(x=>x.id!==id));
  };

  const filtered=reviews.filter(r=>filterStatus==="all"||r.status===filterStatus);
  const pendingCount=reviews.filter(r=>r.status==="pending").length;
  const approvedCount=reviews.filter(r=>r.status==="approved").length;
  const avgRating=approvedCount>0?(reviews.filter(r=>r.status==="approved").reduce((a,b)=>a+b.rating,0)/approvedCount).toFixed(1):"—";

  const stars=(n,size=14)=>[1,2,3,4,5].map(i=>(
    <span key={i} style={{fontSize:size,color:i<=n?"#EF9F27":"#D3D1C7"}}>★</span>
  ));

  const statusInfo={
    pending:{label:"승인 대기",type:"amber"},
    approved:{label:"승인됨",type:"green"},
    rejected:{label:"반려됨",type:"red"},
  };

  if(loading) return <div style={{textAlign:"center",padding:"2rem",color:"#888780"}}>불러오는 중...</div>;

  return(
    <div>
      <SuccessBox msg={successMsg}/>

      {/* KPI */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
        <KpiCard label="승인 대기" value={pendingCount+"개"} sub="검토 필요" valueColor={pendingCount>0?"#E24B4A":"#888780"}/>
        <KpiCard label="승인됨" value={approvedCount+"개"} sub="게시판 공개" valueColor="#27500A"/>
        <KpiCard label="평균 별점" value={avgRating} sub="승인된 리뷰"/>
        <KpiCard label="전체" value={reviews.length+"개"} sub="누적"/>
      </div>

      {/* 필터 */}
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {[["pending","승인 대기"],["approved","승인됨"],["rejected","반려됨"],["all","전체"]].map(([v,label])=>(
          <button key={v} onClick={()=>setFilterStatus(v)}
            style={{fontSize:12,padding:"5px 14px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:filterStatus===v?"#888780":"#D3D1C7",background:filterStatus===v?"#F1EFE8":"transparent",color:filterStatus===v?"#2C2C2A":"#888780",fontWeight:filterStatus===v?500:400}}>
            {label}{v==="pending"&&pendingCount>0?` (${pendingCount})`:""}
          </button>
        ))}
      </div>

      {/* 리뷰 목록 */}
      {filtered.length===0?(
        <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13}}>해당하는 리뷰가 없어요</div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map(r=>(
            <div key={r.id} style={{background:"white",border:`0.5px solid ${r.status==="pending"?"#EF9F27":r.status==="approved"?"#97C459":"#D3D1C7"}`,borderRadius:12,padding:"1rem 1.25rem"}}>
              {/* 헤더 */}
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:AVATAR_COLORS[r.student_id%AVATAR_COLORS.length].bg,color:AVATAR_COLORS[r.student_id%AVATAR_COLORS.length].c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:500,flexShrink:0}}>{r.student_name?.slice(0,2)}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A"}}>{r.student_name}</div>
                  <div style={{fontSize:11,color:"#888780"}}>{r.cls}반 · {r.created_at?.split("T")[0]}</div>
                </div>
                <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
                  {stars(r.rating)}
                  <Badge label={statusInfo[r.status]?.label} type={statusInfo[r.status]?.type||"gray"}/>
                </div>
              </div>
              {/* 내용 */}
              <div style={{fontSize:13,color:"#5F5E5A",lineHeight:1.7,background:"#F1EFE8",borderRadius:8,padding:"10px 12px",marginBottom:12}}>
                {r.content}
              </div>
              {/* 액션 버튼 */}
              <div style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
                {r.status==="pending"&&(
                  <>
                    <button onClick={()=>approve(r)} style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"none",background:"#EAF3DE",color:"#27500A",fontWeight:500,cursor:"pointer"}}>✓ 승인 & 공개</button>
                    <button onClick={()=>reject(r)} style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"none",background:"#FCEBEB",color:"#791F1F",fontWeight:500,cursor:"pointer"}}>✕ 반려</button>
                  </>
                )}
                {r.status==="approved"&&(
                  <>
                    <button onClick={()=>grantBest(r)} style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"none",background:"#3C3489",color:"white",fontWeight:500,cursor:"pointer"}}>👑 베스트 선정 +500P</button>
                    <button onClick={()=>reject(r)} style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>공개 취소</button>
                  </>
                )}
                {r.status==="rejected"&&(
                  <button onClick={()=>approve(r)} style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"0.5px solid #97C459",background:"#EAF3DE",color:"#27500A",cursor:"pointer"}}>승인으로 변경</button>
                )}
                <button onClick={()=>deleteR(r.id)} style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// ════════════════════════════════════════════════
// 포인트 시스템
// ════════════════════════════════════════════════
const POINT_RULES=[
  // 단어시험
  {id:"word_pass",    label:"단어시험 합격",      icon:"📝", amount:100,  cat:"시험"},
  // 모의고사 (1~2등급만, 3등급 없음)
  {id:"mock_1",       label:"모의고사 1등급",      icon:"🥇", amount:800,  cat:"시험"},
  {id:"mock_2",       label:"모의고사 2등급",      icon:"🥈", amount:500,  cat:"시험"},
  // 내신 (1등급만, 2·3등급 없음)
  {id:"school_1",     label:"내신 1등급",          icon:"🏆", amount:800,  cat:"시험"},
  // 과제
  {id:"hw_streak_7",  label:"과제 7연속 제출",     icon:"🔥", amount:800,  cat:"과제"},
  // 참여
  {id:"review",       label:"수업 리뷰 작성",      icon:"⭐", amount:200,  cat:"참여"},
  {id:"review_best",  label:"베스트 리뷰 선정",    icon:"👑", amount:500,  cat:"참여"},
  {id:"attend_month", label:"월 개근",             icon:"📅", amount:300,  cat:"출석"},
  {id:"clinic",       label:"클리닉 신청",         icon:"🗓️", amount:50,   cat:"참여"},
  // 강사 직접 지급
  {id:"manual",       label:"강사 직접 지급",      icon:"🎁", amount:0,    cat:"기타"},
];

// ════════════════════════════════════════════════
// XP & 칭호 시스템
// ════════════════════════════════════════════════
const XP_PER_LEVEL = 2000;

const XP_TITLES = [
  {minLevel:0,  title:"새싹",      icon:"🌱", color:"#639922", bg:"#EAF3DE"},
  {minLevel:3,  title:"도전자",    icon:"⚡", color:"#BA7517", bg:"#FAEEDA"},
  {minLevel:5,  title:"노력가",    icon:"📚", color:"#185FA5", bg:"#E6F1FB"},
  {minLevel:8,  title:"실력자",    icon:"🔥", color:"#791F1F", bg:"#FCEBEB"},
  {minLevel:10, title:"우등생",    icon:"🌟", color:"#3C3489", bg:"#EEEDFE"},
  {minLevel:15, title:"영어고수",  icon:"💎", color:"#0C447C", bg:"#C8E0F9"},
  {minLevel:20, title:"영어왕",    icon:"👑", color:"#633806", bg:"#FAEEDA"},
  {minLevel:30, title:"전설",      icon:"🏆", color:"#791F1F", bg:"#FCEBEB"},
];

function getXpInfo(xp){
  const level  = Math.floor((xp||0) / XP_PER_LEVEL);
  const curXp  = (xp||0) % XP_PER_LEVEL;
  const pct    = Math.round(curXp / XP_PER_LEVEL * 100);
  const title  = [...XP_TITLES].reverse().find(t=>level>=t.minLevel) || XP_TITLES[0];
  return {level, curXp, pct, title, totalXp:xp||0};
}

function XpBadge({xp, size="sm"}){
  const {level,title} = getXpInfo(xp);
  const big = size==="lg";
  return(
    <span style={{
      display:"inline-flex",alignItems:"center",gap:4,
      background:title.bg,color:title.color,
      fontSize:big?13:11,fontWeight:600,
      padding:big?"5px 12px":"3px 8px",
      borderRadius:99,flexShrink:0,
    }}>
      {title.icon} {title.title} <span style={{opacity:0.7,fontWeight:400}}>Lv.{level}</span>
    </span>
  );
}

function XpBar({xp, showLabel=true}){
  const {level,curXp,pct,title,totalXp} = getXpInfo(xp);
  return(
    <div>
      {showLabel&&(
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <span style={{fontSize:11,color:"#888780"}}>다음 레벨까지 {(XP_PER_LEVEL-curXp).toLocaleString()} XP</span>
          <span style={{fontSize:11,color:"#888780"}}>{curXp.toLocaleString()} / {XP_PER_LEVEL.toLocaleString()} XP</span>
        </div>
      )}
      <div style={{background:"#F1EFE8",borderRadius:99,height:8,overflow:"hidden"}}>
        <div style={{width:pct+"%",height:"100%",background:`linear-gradient(90deg,${title.color}99,${title.color})`,borderRadius:99,transition:"width 0.5s ease"}}/>
      </div>
    </div>
  );
}

// 포인트 적립 시 XP도 함께 적립 (포인트 1p = 1xp, 단 차감은 XP에 반영 안 함)
async function addXp(studentId, amount){
  if(amount<=0) return;
  const {data:stu} = await supabase.from("students").select("xp").eq("id",studentId).single();
  const curXp = stu?.xp||0;
  await supabase.from("students").update({xp: curXp + amount}).eq("id",studentId);
}

// ── 과제 7연속 자동 체크 ──
// OMR 제출 기록 기준으로 7연속 달성 시 포인트+XP 지급 (중복 방지)
async function checkHwStreak(studentId, studentName, cls){
  const {data:omrs} = await supabase.from("omr_results")
    .select("created_at").eq("student_id",studentId)
    .order("created_at",{ascending:false});
  if(!omrs||omrs.length<7) return false;
  // 가장 최근 7개가 연속인지 확인 (날짜 기준 7개 이상)
  const count = omrs.length;
  if(count>0&&count%7===0){
    // 이미 이 milestone에 지급했는지 확인
    const milestone = count; // 7, 14, 21 ...
    const {data:existing}=await supabase.from("points")
      .select("id").eq("student_id",studentId)
      .eq("reason",`과제 7연속 제출 (${milestone}회차)`).limit(1);
    if(!existing||existing.length===0){
      await supabase.from("points").insert({
        student_id:studentId, student_name:studentName, cls,
        amount:800, reason:`과제 7연속 제출 (${milestone}회차)`, category:"과제",
      });
      await addXp(studentId, 800);
      return true;
    }
  }
  return false;
}

// ── 월 개근 자동 체크 ──
// 이번 달 출석 기록이 모두 O(출석)인 경우 지급
async function checkMonthlyAttendance(studentId, studentName, cls){
  const now = new Date();
  const ym  = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const {data:att} = await supabase.from("attendance")
    .select("status,date").eq("student_id",studentId)
    .gte("date",ym+"-01").lte("date",ym+"-31");
  if(!att||att.length===0) return false;
  const allPresent = att.every(a=>a.status==="O");
  if(allPresent&&att.length>=4){
    const {data:existing}=await supabase.from("points")
      .select("id").eq("student_id",studentId)
      .eq("reason",`월 개근 (${ym})`).limit(1);
    if(!existing||existing.length===0){
      await supabase.from("points").insert({
        student_id:studentId, student_name:studentName, cls,
        amount:300, reason:`월 개근 (${ym})`, category:"출석",
      });
      await addXp(studentId, 300);
      return true;
    }
  }
  return false;
}

// 포인트 지급 헬퍼
async function grantPoints(studentId,studentName,cls,ruleId,customAmount,customReason){
  const rule=POINT_RULES.find(r=>r.id===ruleId);
  const amount=customAmount??rule?.amount??0;
  const reason=customReason||rule?.label||"포인트 지급";
  await supabase.from("points").insert({
    student_id:studentId, student_name:studentName, cls,
    amount, reason, category:rule?.cat||"기타",
  });
  if(amount>0) await addXp(studentId, amount);
}

// 등급 → 포인트 자동 매핑
// 모의고사: 1등급 800p, 2등급 500p (3등급 이하 없음)
// 내신:     1등급 800p (2·3등급 없음)
function getGradePoints(examType, grade){
  if(examType==="mock"){
    if(grade==="1등급") return {ruleId:"mock_1",   amount:800};
    if(grade==="2등급") return {ruleId:"mock_2",   amount:500};
    // 3등급 이하 포인트 없음
  }
  if(examType==="school"){
    if(grade==="1등급") return {ruleId:"school_1", amount:800};
    // 2·3등급 포인트 없음
  }
  return null;
}

// ── 강사 포인트 관리 ──
function TeacherPoints(){
  const [records,setRecords]   = useState([]);
  const [loading,setLoading]   = useState(true);
  const [filterCls,setFilterCls] = useState("all");
  const [filterStu,setFilterStu] = useState("");
  const [tab,setTab]           = useState("leaderboard");
  const [grantForm,setGrantForm] = useState({studentId:"",ruleId:"word_pass",customAmount:"",reason:""});
  const [successMsg,setSuccessMsg] = useState("");
  // 상점 관리
  const [shopItems,setShopItems]   = useState([]);
  const [shopOrders,setShopOrders] = useState([]);
  const [shopForm,setShopForm]     = useState({name:"",description:"",price:"",stock:-1,image_url:""});
  const [showShopForm,setShowShopForm] = useState(false);

  const load=async()=>{
    const [{data:pts},{data:items},{data:orders}]=await Promise.all([
      supabase.from("points").select("*").order("created_at",{ascending:false}),
      supabase.from("shop_items").select("*").order("created_at"),
      supabase.from("shop_orders").select("*").order("created_at",{ascending:false}),
    ]);
    setRecords(pts||[]);
    setShopItems(items||[]);
    setShopOrders(orders||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  // 실시간 주문 알림
  useEffect(()=>{
    const ch=supabase.channel("shop_orders_ch")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"shop_orders"},()=>load())
      .subscribe();
    return ()=>supabase.removeChannel(ch);
  },[]);

  const pendingOrders = shopOrders.filter(o=>o.status==="pending");

  const completeOrder=async(o)=>{
    await supabase.from("shop_orders").update({status:"done"}).eq("id",o.id);
    setShopOrders(prev=>prev.map(x=>x.id===o.id?{...x,status:"done"}:x));
    setSuccessMsg(`"${o.student_name}"의 "${o.item_name}" 수령 완료!`);
    setTimeout(()=>setSuccessMsg(""),3000);
  };

  const cancelOrder=async(o)=>{
    // 포인트 환불
    await supabase.from("points").insert({
      student_id:o.student_id,student_name:o.student_name,cls:o.cls,
      amount:o.price, reason:`상점 환불: ${o.item_name}`, category:"기타",
    });
    await supabase.from("shop_orders").update({status:"cancelled"}).eq("id",o.id);
    await load();
    setSuccessMsg(`"${o.item_name}" 주문 취소 및 ${o.price}P 환불 완료`);
    setTimeout(()=>setSuccessMsg(""),3000);
  };

  const addShopItem=async()=>{
    if(!shopForm.name.trim()){alert("상품명을 입력해주세요.");return;}
    if(!shopForm.price){alert("가격을 입력해주세요.");return;}
    const {data,error}=await supabase.from("shop_items").insert({
      name:shopForm.name, description:shopForm.description,
      price:parseInt(shopForm.price), stock:shopForm.stock, is_active:true,
      image_url:shopForm.image_url||null,
    }).select().single();
    if(error){alert("오류가 발생했습니다.");return;}
    setShopItems(prev=>[...prev,data]);
    setShopForm({name:"",description:"",price:"",stock:-1,image_url:""});
    setShowShopForm(false);
    setSuccessMsg(`"${shopForm.name}" 상품이 등록됐어요!`);
    setTimeout(()=>setSuccessMsg(""),3000);
  };

  const toggleItem=async(item)=>{
    await supabase.from("shop_items").update({is_active:!item.is_active}).eq("id",item.id);
    setShopItems(prev=>prev.map(x=>x.id===item.id?{...x,is_active:!x.is_active}:x));
  };

  const deleteItem=async(id)=>{
    if(!window.confirm("상품을 삭제할까요?"))return;
    await supabase.from("shop_items").delete().eq("id",id);
    setShopItems(prev=>prev.filter(x=>x.id!==id));
  };

  // 학생별 총 포인트 + XP
  const totals={};
  records.forEach(r=>{
    if(!totals[r.student_id]) totals[r.student_id]={id:r.student_id,name:r.student_name,cls:r.cls,total:0};
    totals[r.student_id].total+=r.amount;
  });
  // XP는 students 테이블에서 — STUDENTS 배열과 조인
  const leaderboard=Object.values(totals).sort((a,b)=>b.total-a.total).map(s=>{
    const stu=STUDENTS.find(x=>x.id===s.id);
    return{...s, xp:stu?.xp||0};
  });

  const grantPoint=async()=>{
    const s=STUDENTS.find(x=>x.id===parseInt(grantForm.studentId));
    if(!s){alert("학생을 선택해주세요.");return;}
    const rule=POINT_RULES.find(r=>r.id===grantForm.ruleId);
    // customAmount 입력 시 우선 사용, 없으면 rule 기본값
    const amount=parseInt(grantForm.customAmount)||rule?.amount||0;
    const baseLabel=rule?.id==="manual"?(grantForm.reason||"강사 직접 지급"):rule?.label||"";
    const reason=grantForm.reason&&rule?.id!=="manual"?`${baseLabel} (${grantForm.reason})`:baseLabel;
    if(amount<=0){alert("포인트 금액을 입력해주세요.");return;}
    await supabase.from("points").insert({
      student_id:s.id,student_name:s.name,cls:s.cls,
      amount,reason,category:rule?.cat||"기타",
    });
    await addXp(s.id, amount);
    await load();
    setSuccessMsg(`${s.name}에게 ${amount}P + ${amount}XP 지급 완료! 🎉`);
    setTimeout(()=>setSuccessMsg(""),3000);
    setGrantForm(f=>({...f,customAmount:"",reason:""}));
  };

  const deleteRecord=async(id)=>{
    if(!window.confirm("이 포인트 기록을 삭제할까요?"))return;
    await supabase.from("points").delete().eq("id",id);
    setRecords(prev=>prev.filter(r=>r.id!==id));
  };

  const filtered=records.filter(r=>
    (filterCls==="all"||r.cls===filterCls)&&
    (!filterStu||r.student_name?.includes(filterStu))
  );

  const clsColor={A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"};
  const medalEmoji=["🥇","🥈","🥉"];

  if(loading) return <div style={{textAlign:"center",padding:"2rem",color:"#888780"}}>불러오는 중...</div>;

  return(
    <div>
      <SuccessBox msg={successMsg}/>
      {/* 탭 */}
      <div style={{display:"flex",gap:4,marginBottom:16}}>
        {[["leaderboard","🏆 순위표"],["history","📋 지급 내역"],["grant","🎁 포인트 지급"],["shop","🛍️ 상점 관리"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{fontSize:12,padding:"6px 14px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:tab===id?"#185FA5":"#D3D1C7",background:tab===id?"#E6F1FB":"transparent",color:tab===id?"#185FA5":"#888780",fontWeight:tab===id?500:400,position:"relative"}}>
            {label}
            {id==="shop"&&pendingOrders.length>0&&(
              <span style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",background:"#E24B4A",color:"white",fontSize:9,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center"}}>{pendingOrders.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* 순위표 */}
      {tab==="leaderboard"&&(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
            <ClassFilter value={filterCls} onChange={setFilterCls}/>
            <div style={{fontSize:12,color:"#888780",marginLeft:"auto"}}>전체 {leaderboard.length}명</div>
          </div>
          {leaderboard.length===0?(
            <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13}}>아직 포인트 기록이 없어요</div>
          ):(
            <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:"#F1EFE8"}}>{["순위","이름","칭호","반","포인트"].map((h,i)=><th key={i} style={{padding:"9px 10px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}</tr></thead>
                <tbody>
                  {leaderboard.filter(s=>filterCls==="all"||s.cls===filterCls).map((s,i)=>(
                    <tr key={s.id} style={{borderBottom:"0.5px solid #F1EFE8"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{padding:"10px 10px",fontWeight:500,fontSize:15}}>{medalEmoji[i]||`${i+1}위`}</td>
                      <td style={{padding:"10px 10px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <Avatar name={s.name} idx={s.id} size={26}/>
                          <span style={{fontWeight:500,fontSize:13}}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{padding:"10px 6px"}}><XpBadge xp={s.xp}/></td>
                      <td style={{padding:"10px 10px"}}><Badge label={clsLabel(s.cls)} type={clsColor[s.cls]||"gray"}/></td>
                      <td style={{padding:"10px 10px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{flex:1,background:"#F1EFE8",borderRadius:99,height:5,overflow:"hidden",maxWidth:70}}>
                            <div style={{width:Math.min(s.total/Math.max(...leaderboard.map(x=>x.total))*100,100)+"%",height:"100%",background:"#EF9F27",borderRadius:99}}/>
                          </div>
                          <span style={{fontWeight:500,color:"#BA7517",fontSize:13}}>{s.total.toLocaleString()}p</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 지급 내역 */}
      {tab==="history"&&(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            <ClassFilter value={filterCls} onChange={setFilterCls}/>
            <input value={filterStu} onChange={e=>setFilterStu(e.target.value)} placeholder="학생 이름 검색..."
              style={{fontSize:12,padding:"5px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",flex:1,minWidth:120}}/>
          </div>
          {filtered.length===0?(
            <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13}}>기록이 없어요</div>
          ):(
            <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:"#F1EFE8"}}>{["이름","반","사유","포인트","날짜",""].map((h,i)=><th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.map(r=>(
                    <tr key={r.id} style={{borderBottom:"0.5px solid #F1EFE8"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{padding:"8px 12px",fontWeight:500}}>{r.student_name}</td>
                      <td style={{padding:"8px 12px"}}><Badge label={clsLabel(r.cls)} type={clsColor[r.cls]||"gray"}/></td>
                      <td style={{padding:"8px 12px",color:"#5F5E5A"}}>{r.reason}</td>
                      <td style={{padding:"8px 12px",fontWeight:500,color:"#BA7517"}}>+{r.amount}p</td>
                      <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{r.created_at?.split("T")[0]}</td>
                      <td style={{padding:"8px 12px"}}>
                        <button onClick={()=>deleteRecord(r.id)} style={{fontSize:11,padding:"2px 8px",borderRadius:4,border:"0.5px solid #F09595",background:"#FCEBEB",color:"#791F1F",cursor:"pointer"}}>삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 포인트 직접 지급 */}
      {tab==="grant"&&(
        <Card mb={0}>
          <SectionTitle>포인트 지급</SectionTitle>
          {/* 포인트 규칙표 */}
          <div style={{background:"#F1EFE8",borderRadius:8,padding:"10px 14px",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:500,color:"#5F5E5A",marginBottom:8}}>포인트 규칙</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
              {POINT_RULES.filter(r=>r.id!=="manual").map(r=>(
                <div key={r.id} style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#888780",padding:"2px 0"}}>
                  <span>{r.icon} {r.label}</span>
                  <span style={{fontWeight:500,color:"#BA7517"}}>{r.amount}p</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div>
              <div style={{fontSize:12,color:"#888780",marginBottom:4}}>학생 선택 *</div>
              <select value={grantForm.studentId} onChange={e=>setGrantForm(f=>({...f,studentId:e.target.value}))}
                style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}>
                <option value="">학생을 선택하세요</option>
                {STUDENTS.map(s=><option key={s.id} value={s.id}>{s.name} ({s.cls}반)</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:12,color:"#888780",marginBottom:4}}>지급 사유 *</div>
              <select value={grantForm.ruleId} onChange={e=>{
                const rule=POINT_RULES.find(r=>r.id===e.target.value);
                setGrantForm(f=>({...f,ruleId:e.target.value,customAmount:rule?.amount>0?String(rule.amount):""}));
              }}
                style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}>
                {POINT_RULES.map(r=><option key={r.id} value={r.id}>{r.icon} {r.label} {r.amount>0?`(기본 ${r.amount}p)`:""}</option>)}
              </select>
            </div>
          </div>
          {/* 모든 항목에서 포인트 금액 수정 가능 */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div>
              <div style={{fontSize:12,color:"#888780",marginBottom:4}}>지급 포인트 *</div>
              <input type="number" value={grantForm.customAmount}
                onChange={e=>setGrantForm(f=>({...f,customAmount:e.target.value}))}
                placeholder={`기본: ${POINT_RULES.find(r=>r.id===grantForm.ruleId)?.amount||0}p`}
                style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
              <div style={{fontSize:11,color:"#888780",marginTop:3}}>기본값에서 변경 가능해요</div>
            </div>
            <div>
              <div style={{fontSize:12,color:"#888780",marginBottom:4}}>메모 (선택)</div>
              <input value={grantForm.reason}
                onChange={e=>setGrantForm(f=>({...f,reason:e.target.value}))}
                placeholder="추가 메모 입력"
                style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
            </div>
          </div>
          <div style={{background:"#FAEEDA",borderRadius:8,padding:"8px 14px",marginBottom:12,fontSize:13,color:"#633806"}}>
            💰 지급 포인트: <b>{parseInt(grantForm.customAmount)||POINT_RULES.find(r=>r.id===grantForm.ruleId)?.amount||0}p</b>
            &nbsp;+&nbsp;
            <b>{parseInt(grantForm.customAmount)||POINT_RULES.find(r=>r.id===grantForm.ruleId)?.amount||0}XP</b> 자동 적립
          </div>
          <BtnPrimary onClick={grantPoint} style={{width:"100%",padding:"11px"}}>포인트 지급하기</BtnPrimary>
        </Card>
      )}

      {/* ── 상점 관리 탭 ── */}
      {tab==="shop"&&(
        <div>
          {pendingOrders.length>0&&(
            <div style={{background:"#FCEBEB",border:"0.5px solid #F09595",borderRadius:10,padding:"10px 14px",marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:600,color:"#791F1F",marginBottom:8}}>🔔 처리 대기 주문 {pendingOrders.length}건</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {pendingOrders.map(o=>(
                  <div key={o.id} style={{background:"white",borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A"}}>{o.student_name} <span style={{fontSize:11,color:"#888780"}}>({o.cls}반)</span></div>
                      <div style={{fontSize:12,color:"#5F5E5A"}}>{o.item_name} — {o.price.toLocaleString()}P</div>
                      <div style={{fontSize:10,color:"#888780"}}>{o.created_at?.split("T")[0]}</div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>completeOrder(o)} style={{fontSize:12,padding:"5px 12px",borderRadius:8,border:"none",background:"#EAF3DE",color:"#27500A",fontWeight:500,cursor:"pointer"}}>✓ 수령완료</button>
                      <button onClick={()=>cancelOrder(o)} style={{fontSize:12,padding:"5px 12px",borderRadius:8,border:"0.5px solid #F09595",background:"#FCEBEB",color:"#791F1F",cursor:"pointer"}}>취소·환불</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:500,color:"#2C2C2A"}}>상품 목록 ({shopItems.length}개)</div>
            <BtnPrimary onClick={()=>setShowShopForm(!showShopForm)}>+ 상품 등록</BtnPrimary>
          </div>
          {showShopForm&&(
            <Card mb={12}>
              <SectionTitle>새 상품 등록</SectionTitle>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                <div style={{gridColumn:"1/-1"}}>
                  <div style={{fontSize:12,color:"#888780",marginBottom:4}}>상품명 *</div>
                  <input value={shopForm.name} onChange={e=>setShopForm({...shopForm,name:e.target.value})} placeholder="예: 아이스크림 쿠폰"
                    style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <div style={{fontSize:12,color:"#888780",marginBottom:4}}>설명 (선택)</div>
                  <input value={shopForm.description} onChange={e=>setShopForm({...shopForm,description:e.target.value})} placeholder="예: CU 편의점 3,000원 이용권"
                    style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <div style={{fontSize:12,color:"#888780",marginBottom:4}}>가격 (P) *</div>
                  <input type="number" value={shopForm.price} onChange={e=>setShopForm({...shopForm,price:e.target.value})} placeholder="예: 2500"
                    style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <div style={{fontSize:12,color:"#888780",marginBottom:4}}>재고 (-1=무제한)</div>
                  <input type="number" value={shopForm.stock} onChange={e=>setShopForm({...shopForm,stock:parseInt(e.target.value)||-1})} placeholder="-1"
                    style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <div style={{fontSize:12,color:"#888780",marginBottom:4}}>상품 이미지 URL (선택)</div>
                  <input value={shopForm.image_url} onChange={e=>setShopForm({...shopForm,image_url:e.target.value})} placeholder="https://images.unsplash.com/..."
                    style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
                  <div style={{fontSize:11,color:"#888780",marginTop:3}}>비워두면 기본 아이콘 표시</div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
                <BtnSecondary onClick={()=>setShowShopForm(false)}>취소</BtnSecondary>
                <BtnPrimary onClick={addShopItem}>등록 완료</BtnPrimary>
              </div>
            </Card>
          )}
          {shopItems.length===0?(
            <div style={{textAlign:"center",padding:"2rem",color:"#888780",fontSize:13,background:"white",borderRadius:12,border:"0.5px solid #D3D1C7"}}>
              아직 등록된 상품이 없어요
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {shopItems.map(item=>(
                <div key={item.id} style={{background:"white",borderRadius:14,overflow:"hidden",border:`0.5px solid ${item.is_active?"#D3D1C7":"#F0EEE8"}`,opacity:item.is_active?1:0.6,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                  <div style={{height:100,background:"#F1EFE8",position:"relative",overflow:"hidden"}}>
                    {item.image_url?(
                      <img src={item.image_url} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
                    ):(
                      <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>🎁</div>
                    )}
                    {item.stock>0&&item.stock<=10&&(
                      <div style={{position:"absolute",top:6,right:6,background:"rgba(30,30,30,0.75)",color:"white",fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:99}}>
                        남은 수량: {item.stock}
                      </div>
                    )}
                  </div>
                  <div style={{padding:"8px 10px"}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#2C2C2A",marginBottom:2}}>{item.name}</div>
                    <div style={{fontSize:14,fontWeight:700,color:"#EF9F27",marginBottom:6}}>{item.price.toLocaleString()}P</div>
                    <div style={{display:"flex",gap:4}}>
                      <button onClick={()=>toggleItem(item)} style={{flex:1,fontSize:11,padding:"4px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>
                        {item.is_active?"숨기기":"공개"}
                      </button>
                      <button onClick={()=>deleteItem(item.id)} style={{flex:1,fontSize:11,padding:"4px",borderRadius:6,border:"0.5px solid #F09595",background:"#FCEBEB",color:"#791F1F",cursor:"pointer"}}>삭제</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {shopOrders.length>0&&(
            <Card mb={0}>
              <SectionTitle>전체 주문 내역</SectionTitle>
              <div style={{border:"0.5px solid #D3D1C7",borderRadius:8,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{background:"#F1EFE8"}}>{["학생","상품","P","상태","날짜"].map((h,i)=><th key={i} style={{padding:"8px 10px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {shopOrders.map((o,i)=>(
                      <tr key={o.id} style={{borderBottom:"0.5px solid #F1EFE8"}} onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{padding:"8px 10px",fontWeight:500}}>{o.student_name}<span style={{fontSize:10,color:"#888780"}}> ({o.cls}반)</span></td>
                        <td style={{padding:"8px 10px",fontSize:12}}>{o.item_name}</td>
                        <td style={{padding:"8px 10px",color:"#E24B4A",fontWeight:500,fontSize:12}}>-{o.price.toLocaleString()}</td>
                        <td style={{padding:"8px 10px"}}><Badge label={o.status==="pending"?"대기":o.status==="done"?"완료":"취소"} type={o.status==="pending"?"amber":o.status==="done"?"green":"red"}/></td>
                        <td style={{padding:"8px 10px",color:"#888780",fontSize:11}}>{o.created_at?.split("T")[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ── 학생 포인트 조회 ──
function StudentPointsView({student}){
  const [records,setRecords]     = useState([]);
  const [loading,setLoading]     = useState(true);
  const [allTotals,setAllTotals] = useState([]);
  const [tab,setTab]             = useState("points");
  const [shopItems,setShopItems] = useState([]);
  const [orders,setOrders]       = useState([]);
  const [buyingId,setBuyingId]   = useState(null);
  const [successMsg,setSuccessMsg] = useState("");
  const [myXp,setMyXp]           = useState(student.xp||0);

  const load=async()=>{
    const [
      {data:mine},{data:all},
      {data:items},{data:myOrders},{data:stuData}
    ]=await Promise.all([
      supabase.from("points").select("*").eq("student_id",student.id).order("created_at",{ascending:false}),
      supabase.from("points").select("student_id,student_name,cls,amount"),
      supabase.from("shop_items").select("*").eq("is_active",true).order("created_at"),
      supabase.from("shop_orders").select("*").eq("student_id",student.id).order("created_at",{ascending:false}),
      supabase.from("students").select("xp").eq("id",student.id).single(),
    ]);
    setRecords(mine||[]);
    const totals={};
    (all||[]).forEach(r=>{
      if(!totals[r.student_id]) totals[r.student_id]={id:r.student_id,name:r.student_name,cls:r.cls,total:0};
      totals[r.student_id].total+=r.amount;
    });
    setAllTotals(Object.values(totals).sort((a,b)=>b.total-a.total));
    setShopItems(items||[]);
    setOrders(myOrders||[]);
    setMyXp(stuData?.xp||0);
    setLoading(false);
  };
  useEffect(()=>{load();},[student.id]);

  const myTotal  = records.reduce((a,b)=>a+b.amount,0);
  const myRank   = allTotals.findIndex(s=>s.id===student.id)+1||null;
  const clsRank  = allTotals.filter(s=>s.cls===student.cls).findIndex(s=>s.id===student.id)+1||null;
  const clsTotal = allTotals.filter(s=>s.cls===student.cls).length;

  const catColors={시험:"#185FA5",과제:"#27500A",참여:"#633806",기타:"#888780"};
  const catBgs   ={시험:"#E6F1FB",과제:"#EAF3DE",참여:"#FAEEDA",기타:"#F1EFE8"};

  const buy=async(item)=>{
    if(myTotal < item.price){alert(`포인트가 부족해요! (현재 ${myTotal}P, 필요 ${item.price}P)`);return;}
    if(!window.confirm(`"${item.name}" (${item.price}P)를 구매할까요?`))return;
    setBuyingId(item.id);
    // 포인트 차감
    const {error:pe}=await supabase.from("points").insert({
      student_id:student.id, student_name:student.name, cls:student.cls,
      amount:-item.price, reason:`상점: ${item.name}`, category:"구매",
    });
    if(pe){alert("오류가 발생했습니다.");setBuyingId(null);return;}
    // 주문 생성
    await supabase.from("shop_orders").insert({
      student_id:student.id, student_name:student.name, cls:student.cls,
      item_id:item.id, item_name:item.name, price:item.price, status:"pending",
    });
    setBuyingId(null);
    setSuccessMsg(`"${item.name}" 구매 완료! 선생님께 알림이 전송됐어요 🎉`);
    setTimeout(()=>setSuccessMsg(""),4000);
    await load();
  };

  if(loading) return <div style={{textAlign:"center",padding:"2rem",color:"#888780",fontSize:13}}>불러오는 중...</div>;

  return(
    <div>
      <SuccessBox msg={successMsg}/>

      {/* 포인트 요약 헤더 */}
      {/* ── XP / 칭호 카드 ── */}
      {(()=>{
        const xpInfo=getXpInfo(myXp);
        return(
          <div style={{background:`linear-gradient(135deg,${xpInfo.title.color}22,${xpInfo.title.color}44)`,border:`1px solid ${xpInfo.title.color}55`,borderRadius:16,padding:"1.25rem",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <XpBadge xp={myXp} size="lg"/>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:"#888780"}}>총 누적 XP</div>
                <div style={{fontSize:20,fontWeight:700,color:xpInfo.title.color}}>{xpInfo.totalXp.toLocaleString()} XP</div>
              </div>
            </div>
            <XpBar xp={myXp}/>
          </div>
        );
      })()}

      {/* ── 포인트 요약 ── */}
      <div style={{background:"linear-gradient(135deg,#BA7517,#EF9F27)",borderRadius:14,padding:"1rem 1.25rem",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",color:"white"}}>
        <div>
          <div style={{fontSize:12,opacity:0.9,marginBottom:2}}>사용 가능 포인트</div>
          <div style={{fontSize:32,fontWeight:700,lineHeight:1}}>{myTotal.toLocaleString()} <span style={{fontSize:16}}>P</span></div>
        </div>
        <div style={{textAlign:"right",fontSize:12,opacity:0.9}}>
          {myRank&&<div>전체 {myRank}위</div>}
          {clsRank&&<div>{student.cls}반 {clsRank}/{clsTotal}위</div>}
        </div>
      </div>

      {/* 탭 */}
      <div style={{display:"flex",gap:4,marginBottom:14}}>
        {[["points","💰 포인트 내역"],["shop","🛍️ 포인트 상점"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,fontSize:13,padding:"9px",borderRadius:10,cursor:"pointer",border:`0.5px solid ${tab===id?"#EF9F27":"#D3D1C7"}`,background:tab===id?"#FAEEDA":"white",color:tab===id?"#633806":"#888780",fontWeight:tab===id?600:400}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── 포인트 내역 탭 ── */}
      {tab==="points"&&(
        <>
          <Card mb={12}>
            <SectionTitle>포인트 획득 방법</SectionTitle>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {POINT_RULES.filter(r=>r.id!=="manual").map(r=>(
                <div key={r.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 10px",background:catBgs[r.cat]||"#F1EFE8",borderRadius:6}}>
                  <span style={{fontSize:12,color:"#5F5E5A"}}>{r.icon} {r.label}</span>
                  <span style={{fontSize:12,fontWeight:500,color:catColors[r.cat]||"#888780"}}>{r.amount}p</span>
                </div>
              ))}
            </div>
          </Card>
          <Card mb={0}>
            <SectionTitle>포인트 내역</SectionTitle>
            {records.length===0?(
              <div style={{textAlign:"center",padding:"1.5rem",color:"#888780",fontSize:13}}>아직 포인트가 없어요. 열심히 해봐요! 😊</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {records.map((r,i)=>(
                  <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<records.length-1?"0.5px solid #F1EFE8":"none"}}>
                    <div style={{width:36,height:36,borderRadius:10,background:r.amount<0?"#FCEBEB":catBgs[r.category]||"#F1EFE8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                      {r.amount<0?"🛍️":POINT_RULES.find(x=>x.label===r.reason)?.icon||"🎁"}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A"}}>{r.reason}</div>
                      <div style={{fontSize:11,color:"#888780"}}>{r.created_at?.split("T")[0]}</div>
                    </div>
                    <div style={{fontSize:15,fontWeight:500,color:r.amount<0?"#E24B4A":"#EF9F27"}}>{r.amount>0?"+":""}{r.amount}p</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* ── 포인트 상점 탭 ── */}
      {tab==="shop"&&(
        <>
          {/* 포인트 잔액 */}
          <div style={{background:"linear-gradient(135deg,#1a1a2e,#2d2d5e)",borderRadius:14,padding:"14px 20px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.7)"}}>사용 가능 포인트</div>
            <div style={{fontSize:22,fontWeight:700,color:"#EF9F27"}}>{myTotal.toLocaleString()} P</div>
          </div>

          {/* 상품 그리드 */}
          {shopItems.length===0?(
            <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13,background:"white",borderRadius:12,border:"0.5px solid #D3D1C7"}}>
              아직 등록된 상품이 없어요
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              {shopItems.map(item=>{
                const canBuy=myTotal>=item.price;
                const isBuying=buyingId===item.id;
                const hasStock=item.stock===-1||item.stock>0;
                return(
                  <div key={item.id} style={{background:"white",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",border:"0.5px solid #E8E6E0"}}>
                    <div style={{position:"relative",height:130,background:"#F1EFE8",overflow:"hidden"}}>
                      {item.image_url?(
                        <img src={item.image_url} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                      ):(
                        <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>🎁</div>
                      )}
                      {item.stock>0&&item.stock<=10&&(
                        <div style={{position:"absolute",top:8,right:8,background:"rgba(30,30,30,0.75)",color:"white",fontSize:10,fontWeight:600,padding:"3px 8px",borderRadius:99}}>
                          남은 수량: {item.stock}
                        </div>
                      )}
                      {!hasStock&&(
                        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{color:"white",fontSize:13,fontWeight:600}}>품절</span>
                        </div>
                      )}
                    </div>
                    <div style={{padding:"10px 12px"}}>
                      <div style={{fontSize:13,fontWeight:600,color:"#1a1a2e",marginBottom:2,lineHeight:1.3}}>{item.name}</div>
                      {item.description&&<div style={{fontSize:11,color:"#888780",marginBottom:6,lineHeight:1.4}}>{item.description}</div>}
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div style={{fontSize:16,fontWeight:700,color:"#EF9F27"}}>{item.price.toLocaleString()} P</div>
                        <button onClick={()=>buy(item)} disabled={!canBuy||isBuying||!hasStock}
                          style={{fontSize:12,fontWeight:600,padding:"7px 14px",borderRadius:8,border:"none",background:!hasStock?"#D3D1C7":canBuy?"#1a1a2e":"#D3D1C7",color:"white",cursor:canBuy&&hasStock?"pointer":"default"}}>
                          {isBuying?"처리중":!hasStock?"품절":canBuy?"구매":"부족"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 포인트 만료 안내 */}
          <div style={{background:"#FFF8E1",border:"0.5px solid #EF9F27",borderRadius:12,padding:"14px 16px",marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:600,color:"#633806",marginBottom:4}}>⚠️ 포인트 만료 안내</div>
            <div style={{fontSize:12,color:"#633806",lineHeight:1.7}}>
              포인트는 <b>6개월 이내</b>에 사용하지 않으면 자동으로 소멸됩니다.<br/>
              단어시험, 상품 구매 등 활동이 6개월간 없으면 보유 포인트가 초기화됩니다.
            </div>
          </div>

          {/* 내 구매 내역 */}
          {orders.length>0&&(
            <Card mb={0}>
              <SectionTitle>내 구매 내역</SectionTitle>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {orders.map((o,i)=>(
                  <div key={o.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:i<orders.length-1?"0.5px solid #F1EFE8":"none"}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A"}}>{o.item_name}</div>
                      <div style={{fontSize:11,color:"#888780"}}>{o.created_at?.split("T")[0]}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:13,color:"#E24B4A",fontWeight:500}}>-{o.price.toLocaleString()}P</div>
                      <Badge label={o.status==="pending"?"처리중":o.status==="done"?"수령완료":"취소"} type={o.status==="pending"?"amber":o.status==="done"?"green":"red"}/>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}


// ════════════════════════════════════════════════
// 단어 퀴즈 — 강사용 (단어장 만들기)
// ════════════════════════════════════════════════
function TeacherVocab(){
  const [sets,setSets]           = useState([]);
  const [view,setView]           = useState("list");
  const [selSet,setSelSet]       = useState(null);
  const [form,setForm]           = useState({title:"",description:"",targetCls:"전체",words:[{en:"",ko:""}]});
  const [successMsg,setSuccessMsg] = useState("");
  const [results,setResults]     = useState([]);
  const [extracting,setExtracting] = useState(false);
  const [extractMsg,setExtractMsg] = useState("");
  const fileRef = useRef();

  useEffect(()=>{
    supabase.from("vocab_sets").select("*").order("created_at",{ascending:false}).then(({data})=>setSets(data||[]));
    supabase.from("vocab_results").select("*").order("created_at",{ascending:false}).then(({data})=>setResults(data||[]));
  },[]);

  const openNew=()=>{setForm({title:"",description:"",targetCls:"전체",words:[{en:"",ko:""}]});setSelSet(null);setExtractMsg("");setView("edit");};
  const openEdit=(s)=>{setSelSet(s);setForm({title:s.title,description:s.description||"",targetCls:s.target_cls||"전체",words:s.words||[{en:"",ko:""}]});setExtractMsg("");setView("edit");};

  // ── PDF/이미지 → Claude API → 단어 추출 ──
  const handleFileUpload=async(e)=>{
    const file=e.target.files?.[0];
    if(!file) return;
    const isPdf=file.type==="application/pdf";
    const isImg=file.type.startsWith("image/");
    if(!isPdf&&!isImg){alert("PDF 또는 이미지 파일만 업로드할 수 있어요.");return;}
    setExtracting(true);
    setExtractMsg("파일 읽는 중...");
    try{
      let base64;
      let mediaType=file.type;

      if(isImg){
        // 이미지는 Canvas로 압축해서 용량 줄이기
        base64=await new Promise((res,rej)=>{
          const img=new Image();
          const url=URL.createObjectURL(file);
          img.onload=()=>{
            const MAX=1024;
            let w=img.width, h=img.height;
            if(w>MAX||h>MAX){
              if(w>h){h=Math.round(h*MAX/w);w=MAX;}
              else{w=Math.round(w*MAX/h);h=MAX;}
            }
            const canvas=document.createElement("canvas");
            canvas.width=w; canvas.height=h;
            const ctx=canvas.getContext("2d");
            ctx.drawImage(img,0,0,w,h);
            const dataUrl=canvas.toDataURL("image/jpeg",0.8);
            URL.revokeObjectURL(url);
            res(dataUrl.split(",")[1]);
          };
          img.onerror=()=>rej(new Error("이미지 읽기 실패"));
          img.src=url;
        });
        mediaType="image/jpeg";
      } else {
        // PDF는 그대로 base64
        base64=await new Promise((res,rej)=>{
          const reader=new FileReader();
          reader.onload=()=>res(reader.result.split(",")[1]);
          reader.onerror=()=>rej(new Error("읽기 실패"));
          reader.readAsDataURL(file);
        });
      }

      setExtractMsg("Claude AI가 단어를 추출하는 중...");
      const contentBlock=isPdf
        ?{type:"document",source:{type:"base64",media_type:"application/pdf",data:base64}}
        :{type:"image",source:{type:"base64",media_type:mediaType,data:base64}};

      const resp=await fetch("/.netlify/functions/claude-proxy",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:2000,
          messages:[{
            role:"user",
            content:[
              contentBlock,
              {type:"text",text:'이 파일에서 영어 단어와 한국어 뜻 쌍을 모두 추출해주세요. 반드시 순수 JSON 배열만 출력하세요. 예시: [{"en":"ambiguous","ko":"모호한"},{"en":"diligent","ko":"부지런한"}] 설명, 마크다운, 다른 텍스트는 절대 쓰지 마세요.'}
            ]
          }]
        })
      });
      if(!resp.ok){
        const errData=await resp.json().catch(()=>({}));
        console.error("API error:", resp.status, errData);
        setExtractMsg("");
        setExtracting(false);
        alert(`오류가 발생했어요 (${resp.status}). 잠시 후 다시 시도해주세요.`);
        e.target.value="";
        return;
      }
      const data=await resp.json();
      const text=(data.content||[]).map(c=>c.text||"").join("");
      const clean=text.replace(/```json\n?|```\n?/g,"").trim();
      let words;
      try{ words=JSON.parse(clean); }
      catch{
        const match=clean.match(/\[[\s\S]*\]/);
        words=match?JSON.parse(match[0]):[];
      }
      if(!Array.isArray(words)||words.length===0){
        alert("단어를 찾지 못했어요. 단어와 뜻이 명확히 보이는 파일을 올려주세요.");
        setExtractMsg("");
        setExtracting(false);
        e.target.value="";
        return;
      }
      const cleaned=words.filter(w=>w.en&&w.ko).map(w=>({en:String(w.en).trim(),ko:String(w.ko).trim()}));
      setForm(f=>({...f,words:cleaned}));
      setExtractMsg(`✅ ${cleaned.length}개 단어가 추출됐어요! 아래에서 확인·수정 후 저장해주세요.`);
    }catch(err){
      console.error("추출 오류:", err);
      setExtractMsg("");
      alert("추출 중 오류가 발생했어요. 다시 시도해주세요.");
    }
    setExtracting(false);
    e.target.value="";
  };

  const save=async()=>{
    if(!form.title.trim()){alert("단어장 제목을 입력해주세요.");return;}
    const validWords=form.words.filter(w=>w.en.trim()&&w.ko.trim());
    if(validWords.length<4){alert("단어를 최소 4개 이상 입력해주세요.");return;}
    const payload={title:form.title,description:form.description,target_cls:form.targetCls,words:validWords};
    if(selSet){
      const {error}=await supabase.from("vocab_sets").update(payload).eq("id",selSet.id);
      if(error){alert("저장 오류");return;}
      setSets(prev=>prev.map(s=>s.id===selSet.id?{...s,...payload}:s));
    } else {
      const {data,error}=await supabase.from("vocab_sets").insert(payload).select().single();
      if(error){alert("저장 오류");return;}
      setSets(prev=>[data,...prev]);
    }
    setSuccessMsg(`"${form.title}" 단어장이 저장됐어요!`);
    setTimeout(()=>setSuccessMsg(""),3000);
    setView("list");
  };

  const deleteSet=async(id)=>{
    if(!window.confirm("이 단어장을 삭제할까요?"))return;
    await supabase.from("vocab_sets").delete().eq("id",id);
    setSets(prev=>prev.filter(s=>s.id!==id));
  };

  const addWord=()=>setForm(f=>({...f,words:[...f.words,{en:"",ko:""}]}));
  const removeWord=(i)=>setForm(f=>({...f,words:f.words.filter((_,j)=>j!==i)}));
  const updateWord=(i,field,val)=>setForm(f=>{const w=[...f.words];w[i]={...w[i],[field]:val};return{...f,words:w};});

  if(view==="edit") return(
    <div>
      <button onClick={()=>setView("list")} style={{fontSize:13,color:"#888780",background:"transparent",border:"none",cursor:"pointer",marginBottom:16}}>← 목록으로</button>
      <Card mb={0}>
        <SectionTitle>{selSet?"단어장 수정":"새 단어장 만들기"}</SectionTitle>

        {/* ── AI 단어 자동 추출 (PDF/이미지) ── */}
        <div style={{background:"#E6F1FB",border:"0.5px solid #85B7EB",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:500,color:"#0C447C",marginBottom:6}}>🤖 AI로 단어 자동 추출</div>
          <div style={{fontSize:12,color:"#888780",marginBottom:10}}>단어장 PDF나 교재 사진을 올리면 Claude AI가 단어와 뜻을 자동으로 추출해요</div>
          <input ref={fileRef} type="file" accept=".pdf,image/*" onChange={handleFileUpload} style={{display:"none"}}/>
          <button onClick={()=>fileRef.current?.click()} disabled={extracting}
            style={{fontSize:13,padding:"8px 18px",borderRadius:8,border:"none",background:extracting?"#D3D1C7":"#185FA5",color:"white",fontWeight:500,cursor:extracting?"default":"pointer",display:"flex",alignItems:"center",gap:6}}>
            {extracting?"⏳ 추출 중...":"📎 PDF / 이미지 업로드"}
          </button>
          {extractMsg&&extractMsg.startsWith("✅")&&(
            <div style={{fontSize:12,marginTop:10,color:"#27500A",fontWeight:500}}>{extractMsg}</div>
          )}
        </div>

        {/* ── 텍스트 붙여넣기 ── */}
        <div style={{background:"#F1EFE8",border:"0.5px solid #D3D1C7",borderRadius:10,padding:"14px 16px",marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A",marginBottom:4}}>📋 텍스트 붙여넣기</div>
          <div style={{fontSize:12,color:"#888780",marginBottom:8}}>단어와 뜻을 아래에 붙여넣으면 자동으로 분리해줘요 (한 줄에 하나씩)</div>
          <textarea
            placeholder={"예) apple 사과\nambiguous 모호한\ndiligent - 부지런한"}
            rows={4}
            id="pasteArea"
            style={{width:"100%",fontSize:12,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",resize:"vertical",boxSizing:"border-box",marginBottom:8,fontFamily:"inherit"}}/>
          <button onClick={()=>{
            const txt=document.getElementById("pasteArea").value;
            if(!txt.trim()){alert("텍스트를 입력해주세요.");return;}
            const lines=txt.split("\n").filter(l=>l.trim());
            const words=[];
            lines.forEach(line=>{
              const parts=line.replace(/-/g," ").trim().split(/\s+/);
              if(parts.length>=2){
                const en=parts[0].trim();
                const ko=parts.slice(1).join(" ").trim();
                if(en&&ko) words.push({en,ko});
              }
            });
            if(words.length===0){alert("단어를 찾지 못했어요.\n형식: 영어단어 한국어뜻 (한 줄에 하나씩)");return;}
            setForm(f=>({...f,words}));
            alert(`✅ ${words.length}개 단어가 추출됐어요!`);
          }}
            style={{fontSize:13,padding:"8px 18px",borderRadius:8,border:"none",background:"#185FA5",color:"white",fontWeight:500,cursor:"pointer"}}>
            ✨ 단어 자동 분리
          </button>
        </div>

        <div style={{marginBottom:10}}>
          <div style={{fontSize:12,color:"#888780",marginBottom:4}}>단어장 제목 *</div>
          <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="예: 3월 4주차 단어시험 준비"
            style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:12,color:"#888780",marginBottom:4}}>설명 (선택)</div>
          <input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="예: 교과서 3단원 어휘"
            style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,color:"#888780",marginBottom:4}}>공개 대상</div>
          <div style={{display:"flex",gap:6}}>
            {["전체","A","B","C","D","E","F"].map(c=>(
              <button key={c} onClick={()=>setForm({...form,targetCls:c})}
                style={{padding:"6px 14px",borderRadius:8,cursor:"pointer",border:`0.5px solid ${form.targetCls===c?"#185FA5":"#D3D1C7"}`,background:form.targetCls===c?"#E6F1FB":"transparent",color:form.targetCls===c?"#185FA5":"#888780",fontSize:13,fontWeight:form.targetCls===c?500:400}}>
                {c==="전체"?"전체":c+"반"}
              </button>
            ))}
          </div>
        </div>

        {/* 단어 목록 */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <SectionTitle style={{margin:0}}>단어 목록 ({form.words.filter(w=>w.en.trim()&&w.ko.trim()).length}개)</SectionTitle>
          <button onClick={addWord} style={{fontSize:12,padding:"4px 12px",borderRadius:6,border:"0.5px solid #185FA5",background:"#E6F1FB",color:"#0C447C",cursor:"pointer"}}>+ 단어 추가</button>
        </div>
        <div style={{border:"0.5px solid #D3D1C7",borderRadius:8,overflow:"hidden",marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 36px",background:"#F1EFE8",padding:"7px 10px",fontSize:11,color:"#888780",fontWeight:500}}>
            <span>영어 단어</span><span>한국어 뜻</span><span></span>
          </div>
          <div style={{maxHeight:320,overflowY:"auto"}}>
            {form.words.map((w,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 36px",gap:6,padding:"6px 10px",borderTop:"0.5px solid #F1EFE8",alignItems:"center"}}>
                <input value={w.en} onChange={e=>updateWord(i,"en",e.target.value)} placeholder="예: ambiguous"
                  style={{fontSize:13,padding:"5px 8px",borderRadius:6,border:"0.5px solid #D3D1C7",width:"100%",boxSizing:"border-box"}}/>
                <input value={w.ko} onChange={e=>updateWord(i,"ko",e.target.value)} placeholder="예: 모호한"
                  style={{fontSize:13,padding:"5px 8px",borderRadius:6,border:"0.5px solid #D3D1C7",width:"100%",boxSizing:"border-box"}}/>
                <button onClick={()=>removeWord(i)} style={{fontSize:16,background:"transparent",border:"none",cursor:"pointer",color:"#F09595",padding:0}}>✕</button>
              </div>
            ))}
          </div>
        </div>
        <div style={{fontSize:11,color:"#888780",marginBottom:12}}>최소 4개 이상 입력해야 퀴즈를 만들 수 있어요</div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
          <BtnSecondary onClick={()=>setView("list")}>취소</BtnSecondary>
          <BtnPrimary onClick={save}>저장 완료</BtnPrimary>
        </div>
      </Card>
    </div>
  );

  if(view==="results"&&selSet) return(
    <div>
      <button onClick={()=>setView("list")} style={{fontSize:13,color:"#888780",background:"transparent",border:"none",cursor:"pointer",marginBottom:16}}>← 목록으로</button>
      <div style={{fontSize:15,fontWeight:500,color:"#2C2C2A",marginBottom:4}}>{selSet.title} — 퀴즈 결과</div>
      <div style={{fontSize:12,color:"#888780",marginBottom:16}}>총 {results.filter(r=>r.vocab_set_id===selSet.id).length}명 응시</div>
      {results.filter(r=>r.vocab_set_id===selSet.id).length===0?(
        <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13}}>아직 응시한 학생이 없어요</div>
      ):(
        <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:"#F1EFE8"}}>{["이름","반","점수","날짜"].map((h,i)=><th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>)}</tr></thead>
            <tbody>
              {results.filter(r=>r.vocab_set_id===selSet.id).sort((a,b)=>b.score-a.score).map((r,i)=>{
                const pct=Math.round(r.score/r.total*100);
                const col=pct>=80?"#639922":pct>=60?"#BA7517":"#E24B4A";
                return(<tr key={i} style={{borderBottom:"0.5px solid #F1EFE8"}} onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"8px 12px",fontWeight:500}}>{r.student_name}</td>
                  <td style={{padding:"8px 12px"}}><Badge label={clsLabel(r.cls)} type={{A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"}[r.cls]||"gray"}/></td>
                  <td style={{padding:"8px 12px",fontWeight:500,color:col}}>{r.score}/{r.total} ({pct}%)</td>
                  <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{r.created_at?.split("T")[0]}</td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return(
    <div>
      <SuccessBox msg={successMsg}/>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
        <BtnPrimary onClick={openNew}>+ 새 단어장 만들기</BtnPrimary>
      </div>
      {sets.length===0?(
        <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13}}>
          아직 단어장이 없어요.<br/>단어장을 만들면 학생들이 퀴즈를 풀 수 있어요!
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {sets.map(s=>(
            <div key={s.id} style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:12,padding:"1rem 1.25rem"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:500,color:"#2C2C2A",marginBottom:4}}>{s.title}</div>
                  {s.description&&<div style={{fontSize:12,color:"#888780",marginBottom:6}}>{s.description}</div>}
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <Badge label={s.target_cls==="전체"?"전체 공개":s.target_cls+"반"} type={s.target_cls==="전체"?"gray":s.target_cls==="A"?"blue":s.target_cls==="B"?"green":"amber"}/>
                    <Badge label={`${(s.words||[]).length}개 단어`} type="gray"/>
                    <Badge label={`${results.filter(r=>r.vocab_set_id===s.id).length}명 응시`} type="blue"/>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <button onClick={()=>{setSelSet(s);setView("results");}} style={{fontSize:12,padding:"5px 10px",borderRadius:6,border:"0.5px solid #85B7EB",background:"#E6F1FB",color:"#0C447C",cursor:"pointer"}}>결과 보기</button>
                  <button onClick={()=>openEdit(s)} style={{fontSize:12,padding:"5px 10px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>수정</button>
                  <button onClick={()=>deleteSet(s.id)} style={{fontSize:12,padding:"5px 10px",borderRadius:6,border:"0.5px solid #F09595",background:"#FCEBEB",color:"#791F1F",cursor:"pointer"}}>삭제</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentVocabQuiz({student}){
  const [sets,setSets]           = useState([]);
  const [loading,setLoading]     = useState(true);
  const [selSet,setSelSet]       = useState(null);
  const [quiz,setQuiz]           = useState(null);
  const [cur,setCur]             = useState(0);
  const [selected,setSelected]   = useState(null);
  const [answered,setAnswered]   = useState(false);
  const [wrongs,setWrongs]       = useState([]);
  const [corrects,setCorrects]   = useState(0);
  const [done,setDone]           = useState(false);
  const [myResults,setMyResults] = useState([]);
  const [progList,setProgList]   = useState([]); // 이어하기 가능한 목록
  const [rangeScreen,setRangeScreen]=useState(null);
  const [rangeMode,setRangeMode]=useState("전체");
  const [rangeFrom,setRangeFrom]=useState(1);
  const [rangeTo,setRangeTo]=useState(20);
  const [selectedRanges,setSelectedRanges]=useState([]);

  const loadData=async()=>{
    const [{data:s},{data:r},{data:progs}]=await Promise.all([
      supabase.from("vocab_sets").select("*").order("created_at",{ascending:false}),
      supabase.from("vocab_results").select("*").eq("student_id",student.id).order("created_at",{ascending:false}),
      supabase.from("vocab_progress").select("*").eq("student_id",student.id).order("updated_at",{ascending:false}),
    ]);
    const filtered=(s||[]).filter(x=>x.target_cls==="전체"||x.target_cls===student.cls);
    setSets(filtered);
    setMyResults(r||[]);
    // 이어하기 가능한 목록 (퀴즈가 끝나지 않은 것만)
    const validProgs=(progs||[]).filter(p=>p.quiz&&p.cur<p.quiz.length);
    setProgList(validProgs);
    setLoading(false);
  };
  useEffect(()=>{loadData();},[student.id]);

  // 진행상황 저장
  const saveProgress=async(vocabSetId,quizData,curIdx,correctsCount,wrongsArr)=>{
    // 같은 단어장 진행상황이 있으면 업데이트, 없으면 새로 추가
    const {data:existing}=await supabase.from("vocab_progress")
      .select("id").eq("student_id",student.id).eq("vocab_set_id",vocabSetId).limit(1);
    if(existing&&existing.length>0){
      await supabase.from("vocab_progress").update({
        quiz:quizData, cur:curIdx, corrects:correctsCount,
        wrongs:wrongsArr, updated_at:new Date().toISOString(),
      }).eq("id",existing[0].id);
    } else {
      await supabase.from("vocab_progress").insert({
        student_id:student.id, vocab_set_id:vocabSetId,
        quiz:quizData, cur:curIdx, corrects:correctsCount,
        wrongs:wrongsArr, updated_at:new Date().toISOString(),
      });
    }
  };

  // 진행상황 삭제 (특정 단어장)
  const clearProgress=async(vocabSetId)=>{
    await supabase.from("vocab_progress")
      .delete().eq("student_id",student.id).eq("vocab_set_id",vocabSetId);
  };

  // 이어하기
  const resumeQuiz=async(prog)=>{
    const set=sets.find(s=>s.id===prog.vocab_set_id);
    if(!set) return;
    setSelSet(set);
    setQuiz(prog.quiz);
    setCur(prog.cur);
    setCorrects(prog.corrects);
    setWrongs(prog.wrongs||[]);
    setSelected(null);
    setAnswered(false);
    setDone(false);
    setProgList(prev=>prev.filter(p=>p.id!==prog.id));
  };

  // 이어하기
  // 새 퀴즈 시작
  const openRangeScreen=(set)=>{setRangeScreen(set);setRangeMode("전체");setRangeFrom(1);setRangeTo(Math.min(20,(set.words||[]).length));setSelectedRanges([]);};const startQuizFromRange=()=>{if(!rangeScreen)return;const words=rangeScreen.words||[];let sel;if(rangeMode==="전체"){sel=words;}else if(selectedRanges.length>0){const idx=new Set();selectedRanges.forEach(({f,t})=>{for(let i=f-1;i<Math.min(t,words.length);i++)idx.add(i);});sel=[...idx].sort((a,b)=>a-b).map(i=>words[i]);}else{sel=words.slice(Math.max(0,rangeFrom-1),Math.min(words.length,rangeTo));}if(sel.length<4){alert("최소 4개 이상 필요해요!");return;}const setForQuiz=rangeScreen;setRangeScreen(null);startQuiz(setForQuiz,sel);};const startQuiz=(set,wordsToUse)=>{const allWords=set.words;const words=[...(wordsToUse||allWords)].sort(()=>Math.random()-0.5);
    
    const questions=words.map(w=>{
      const others=set.words.filter(x=>x.en!==w.en).sort(()=>Math.random()-0.5).slice(0,3).map(x=>x.ko);
      const choices=[w.ko,...others].sort(()=>Math.random()-0.5);
      return{en:w.en,answer:w.ko,choices};
    });
    setSelSet(set);
    setQuiz(questions);
    setCur(0);
    setSelected(null);
    setAnswered(false);
    setWrongs([]);
    setCorrects(0);
    setDone(false);
    setResuming(false);
    // 진행상황 초기화 저장
    saveProgress(set.id,questions,0,0,[]);
  };

  const choose=async(choice)=>{
    if(answered) return;
    setSelected(choice);
    setAnswered(true);
    const correct=choice===quiz[cur].answer;
    const newCorrects=correct?corrects+1:corrects;
    const newWrongs=correct?wrongs:[...wrongs,quiz[cur]];
    if(correct) setCorrects(newCorrects);
    else setWrongs(newWrongs);
    // 진행상황 저장 (현재 문제 답변 후 상태)
    await saveProgress(selSet.id,quiz,cur,newCorrects,newWrongs);
  };

  const next=async()=>{
    // choose에서 이미 corrects/wrongs 업데이트했으므로 그대로 사용
    if(cur+1>=quiz.length){
      // 퀴즈 완료
      await supabase.from("vocab_results").insert({
        student_id:student.id,student_name:student.name,cls:student.cls,
        vocab_set_id:selSet.id,vocab_set_title:selSet.title,
        score:corrects,total:quiz.length,
        wrong_words:wrongs.map(w=>w.en),quiz_type:"mc",
      });
      await clearProgress(selSet.id);
      const {data}=await supabase.from("vocab_results").select("*").eq("student_id",student.id).order("created_at",{ascending:false});
      setMyResults(data||[]);
      setDone(true);
    } else {
      const nextIdx=cur+1;
      setCur(nextIdx);
      setSelected(null);
      setAnswered(false);
      // 다음 문제로 진행상황 업데이트
      await saveProgress(selSet.id,quiz,nextIdx,newCorrects,newWrongs);
    }
  };

  if(loading) return <div style={{textAlign:"center",padding:"2rem",color:"#888780",fontSize:13}}>불러오는 중...</div>;

  // ── 퀴즈 완료 화면 ──
  if(rangeScreen){
    const total=(rangeScreen.words||[]).length;
    const cnt=rangeMode==="전체"?total:selectedRanges.length>0?[...new Set(selectedRanges.flatMap(({f,t})=>{const a=[];for(let i=f-1;i<Math.min(t,total);i++)a.push(i);return a;}))].length:Math.max(0,Math.min(total,rangeTo)-(rangeFrom-1));
    const is3mo=rangeScreen.title&&rangeScreen.title.includes("3모 전체");
    const R=[{label:"20번",f:1,t:12},{label:"21번",f:13,t:30},{label:"22번",f:31,t:54},{label:"23번",f:55,t:77},{label:"24번",f:78,t:98},{label:"29번",f:99,t:120},{label:"30번",f:121,t:148},{label:"31번",f:149,t:163},{label:"32번",f:164,t:199},{label:"33번",f:200,t:223},{label:"34번",f:224,t:247},{label:"35번",f:248,t:270},{label:"36번",f:271,t:292},{label:"38번",f:293,t:319},{label:"39번",f:320,t:345},{label:"40번",f:346,t:369},{label:"41·42번",f:370,t:405}];
    return(<div><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}><button onClick={()=>setRangeScreen(null)} style={{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:"#888780"}}>←</button><div style={{fontSize:16,fontWeight:600,color:"#2C2C2A"}}>{rangeScreen.title}</div></div><Card mb={16}><SectionTitle>퀴즈 범위 선택</SectionTitle><div style={{display:"flex",gap:8,marginBottom:16}}>{["전체","범위 선택"].map(m=>(<button key={m} onClick={()=>setRangeMode(m==="전체"?"전체":"범위")} style={{flex:1,padding:"10px",borderRadius:10,cursor:"pointer",border:`1.5px solid ${(rangeMode==="전체"?m==="전체":m==="범위 선택")?"#185FA5":"#D3D1C7"}`,background:(rangeMode==="전체"?m==="전체":m==="범위 선택")?"#E6F1FB":"white",color:(rangeMode==="전체"?m==="전체":m==="범위 선택")?"#185FA5":"#888780",fontSize:13}}>{m==="전체"?`전체 (${total}개)`:"범위 선택"}</button>))}</div>{rangeMode==="범위"&&(<div style={{marginBottom:16}}>{is3mo?(<div><div style={{fontSize:11,color:"#888780",marginBottom:6}}>여러 개 동시 선택 가능 ✓</div><div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>{R.map(({label,f,t})=>{const on=selectedRanges.some(r=>r.label===label);return(<button key={label} onClick={()=>setSelectedRanges(p=>on?p.filter(r=>r.label!==label):[...p,{label,f,t}])} style={{fontSize:12,padding:"5px 12px",borderRadius:99,border:`1px solid ${on?"#185FA5":"#D3D1C7"}`,background:on?"#185FA5":"white",color:on?"white":"#888780",cursor:"pointer"}}>{on?"✓ ":""}{label}</button>);})}</div><div style={{display:"flex",gap:6}}><button onClick={()=>setSelectedRanges(R)} style={{fontSize:12,padding:"5px 12px",borderRadius:99,border:"1px solid #D3D1C7",background:"white",color:"#888780",cursor:"pointer"}}>전체 선택</button><button onClick={()=>setSelectedRanges([])} style={{fontSize:12,padding:"5px 12px",borderRadius:99,border:"1px solid #D3D1C7",background:"white",color:"#888780",cursor:"pointer"}}>전체 해제</button></div></div>):(<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[[1,20],[21,40],[41,60],[61,80],[81,100]].filter(([f,t])=>f<=total).map(([f,t])=>(<button key={f} onClick={()=>{setRangeFrom(f);setRangeTo(Math.min(t,total));}} style={{fontSize:12,padding:"5px 12px",borderRadius:99,border:"1px solid #D3D1C7",background:"white",color:"#888780",cursor:"pointer"}}>{f}~{Math.min(t,total)}번</button>))}</div>)}</div>)}<div style={{background:"#F1EFE8",borderRadius:10,padding:"12px",marginBottom:16,fontSize:13,color:"#888780",textAlign:"center"}}>총 <b style={{color:"#185FA5"}}>{cnt}개</b> 단어</div><BtnPrimary onClick={startQuizFromRange} style={{width:"100%",padding:"13px"}}>퀴즈 시작 →</BtnPrimary></Card></div>);
  }

    if(done){
    const total=quiz.length;
    const pct=Math.round(corrects/total*100);
    const col=pct>=80?"#27500A":pct>=60?"#BA7517":"#E24B4A";
    const bg=pct>=80?"#EAF3DE":pct>=60?"#FAEEDA":"#FCEBEB";
    return(
      <div>
        <div style={{background:bg,border:`0.5px solid ${col}`,borderRadius:16,padding:"1.5rem",textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:40,marginBottom:8}}>{pct>=80?"🎉":pct>=60?"💪":"📚"}</div>
          <div style={{fontSize:28,fontWeight:500,color:col,marginBottom:4}}>{pct}점</div>
          <div style={{fontSize:14,color:col,marginBottom:8}}>{corrects}/{total}개 정답</div>
          <div style={{fontSize:13,color:col}}>{pct>=80?"훌륭해요! 단어를 잘 알고 있어요 😊":pct>=60?"잘 했어요! 조금만 더 연습해봐요 💪":"틀린 단어를 다시 복습해봐요 📚"}</div>
        </div>
        {wrongs.length>0&&(
          <Card mb={12}>
            <SectionTitle>틀린 단어 복습</SectionTitle>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {wrongs.map((w,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"#FCEBEB",borderRadius:8}}>
                  <span style={{fontSize:15,fontWeight:500,color:"#2C2C2A"}}>{w.en}</span>
                  <span style={{fontSize:14,color:"#791F1F",fontWeight:500}}>{w.answer}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
        <div style={{display:"flex",gap:8}}>
          <BtnPrimary onClick={()=>openRangeScreen(selSet)} style={{flex:1}}>다시 풀기</BtnPrimary>
          <BtnSecondary onClick={()=>{setSelSet(null);setQuiz(null);setDone(false);}} style={{flex:1}}>단어장 선택</BtnSecondary>
        </div>
      </div>
    );
  }

  // ── 퀴즈 풀기 화면 ──
  if(quiz){
    const q=quiz[cur];
    const isCorrect=selected===q.answer;
    const progress=(cur/quiz.length)*100;
    return(
      <div>
        <div style={{background:"#F1EFE8",borderRadius:99,height:6,marginBottom:8,overflow:"hidden"}}>
          <div style={{width:progress+"%",height:"100%",background:"#185FA5",borderRadius:99,transition:"width 0.3s"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#888780",marginBottom:20}}>
          <span>{cur+1} / {quiz.length}</span>
          <span>✅ {corrects}개 정답</span>
        </div>
        <div style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:16,padding:"2rem",textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:11,color:"#888780",marginBottom:8}}>다음 단어의 뜻은?</div>
          <div style={{fontSize:32,fontWeight:500,color:"#2C2C2A",letterSpacing:"0.02em"}}>{q.en}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {q.choices.map((choice,i)=>{
            let bg="white",border="0.5px solid #D3D1C7",color="#2C2C2A",fontWeight=400;
            if(answered){
              if(choice===q.answer){bg="#EAF3DE";border="1.5px solid #639922";color="#27500A";fontWeight=500;}
              else if(choice===selected&&!isCorrect){bg="#FCEBEB";border="1.5px solid #E24B4A";color="#791F1F";}
            } else if(choice===selected){
              bg="#E6F1FB";border="1.5px solid #185FA5";color="#185FA5";fontWeight=500;
            }
            return(
              <button key={i} onClick={()=>choose(choice)} disabled={answered}
                style={{padding:"14px 12px",borderRadius:12,cursor:answered?"default":"pointer",border,background:bg,color,fontWeight,fontSize:14,textAlign:"center",transition:"all 0.15s"}}>
                {choice}
              </button>
            );
          })}
        </div>
        {answered&&(
          <div style={{marginBottom:12}}>
            <div style={{background:isCorrect?"#EAF3DE":"#FCEBEB",borderRadius:10,padding:"12px 16px",marginBottom:12,textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:500,color:isCorrect?"#27500A":"#791F1F",marginBottom:2}}>
                {isCorrect?"정답! 🎉":"오답 😢"}
              </div>
              {!isCorrect&&<div style={{fontSize:13,color:"#791F1F"}}>정답: <b>{q.answer}</b></div>}
            </div>
            <button onClick={next} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:"#185FA5",color:"white",fontSize:15,fontWeight:500,cursor:"pointer"}}>
              {cur+1>=quiz.length?"결과 보기 →":"다음 문제 →"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── 단어장 선택 화면 ──
  return(
    <div>
      {/* 이어하기 목록 */}
      {progList.length>0&&(
        <div style={{background:"#E6F1FB",border:"0.5px solid #185FA5",borderRadius:12,padding:"14px 16px",marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:600,color:"#0C447C",marginBottom:10}}>📖 이어서 풀기</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {progList.map(prog=>{
              const set=sets.find(s=>s.id===prog.vocab_set_id);
              if(!set) return null;
              const pct=Math.round(prog.cur/prog.quiz.length*100);
              return(
                <div key={prog.id} style={{background:"white",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#2C2C2A"}}>{set.title}</div>
                    <div style={{fontSize:11,color:"#888780",marginTop:2}}>{prog.cur}/{prog.quiz.length}문제 완료 ({pct}%)</div>
                    <div style={{background:"#F1EFE8",borderRadius:99,height:4,marginTop:6,overflow:"hidden"}}>
                      <div style={{width:pct+"%",height:"100%",background:"#185FA5",borderRadius:99}}/>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={async()=>{await clearProgress(prog.vocab_set_id);setProgList(prev=>prev.filter(p=>p.id!==prog.id));}}
                      style={{fontSize:12,padding:"6px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>삭제</button>
                    <BtnPrimary onClick={()=>resumeQuiz(prog)}>이어하기</BtnPrimary>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 단어장 목록 */}
      <div style={{fontSize:14,fontWeight:500,color:"#2C2C2A",marginBottom:12}}>📚 퀴즈 선택</div>
      {sets.length===0?(
        <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13,background:"white",borderRadius:12,border:"0.5px solid #D3D1C7"}}>
          아직 등록된 단어 퀴즈가 없어요<br/>선생님이 단어장을 만들면 여기 나타나요!
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {sets.map(s=>{
            const myBest=myResults.filter(r=>r.vocab_set_id===s.id);
            const bestPct=myBest.length>0?Math.max(...myBest.map(r=>Math.round(r.score/r.total*100))):null;
            const myHistory=myBest.slice(0,3);
            return(
              <div key={s.id} style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:12,padding:"1rem 1.25rem"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:myHistory.length>0?10:0}}
                  onClick={()=>openRangeScreen(s)} onMouseEnter={e=>e.currentTarget.style.cursor="pointer"}>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,color:"#2C2C2A",marginBottom:4}}>{s.title}</div>
                    {s.description&&<div style={{fontSize:12,color:"#888780",marginBottom:6}}>{s.description}</div>}
                    <Badge label={`${(s.words||[]).length}개 단어`} type="gray"/>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    {bestPct!==null?(
                      <>
                        <span style={{fontSize:11,color:"#888780"}}>최고 점수</span>
                        <span style={{fontSize:18,fontWeight:500,color:bestPct>=80?"#27500A":bestPct>=60?"#BA7517":"#E24B4A"}}>{bestPct}점</span>
                      </>
                    ):(
                      <span style={{fontSize:12,color:"#888780"}}>아직 안 풀었어요</span>
                    )}
                    <button onClick={(e)=>{e.stopPropagation();openRangeScreen(s);}} style={{fontSize:12,padding:"6px 16px",borderRadius:8,border:"none",background:"#185FA5",color:"white",fontWeight:500,cursor:"pointer"}}>
                      {bestPct!==null?"다시 풀기":"퀴즈 시작"}
                    </button>
                  </div>
                </div>
                {/* 이 단어장의 기록 */}
                {myHistory.length>0&&(
                  <div style={{borderTop:"0.5px solid #F1EFE8",paddingTop:8}}>
                    <div style={{fontSize:11,color:"#888780",marginBottom:6}}>최근 기록</div>
                    {myHistory.map((r,i)=>{
                      const pct=Math.round(r.score/r.total*100);
                      const col=pct>=80?"#639922":pct>=60?"#BA7517":"#E24B4A";
                      return(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                          <span style={{fontSize:11,color:"#888780",flex:1}}>{r.created_at?.split("T")[0]}</span>
                          <span style={{fontSize:12,fontWeight:500,color:col}}>{pct}점</span>
                          <div style={{width:50,height:4,background:"#F1EFE8",borderRadius:99,overflow:"hidden"}}>
                            <div style={{width:pct+"%",height:"100%",background:col,borderRadius:99}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const QNA_CATEGORIES=[
  {id:"grammar",   label:"문법",     icon:"📖", color:"#185FA5", bg:"#E6F1FB"},
  {id:"vocab",     label:"어휘",     icon:"📝", color:"#639922", bg:"#EAF3DE"},
  {id:"reading",   label:"독해",     icon:"🔍", color:"#BA7517", bg:"#FAEEDA"},
  {id:"listening", label:"듣기",     icon:"🎧", color:"#3C3489", bg:"#EEEDFE"},
  {id:"writing",   label:"작문",     icon:"✏️", color:"#0C447C", bg:"#C8E0F9"},
  {id:"exam",      label:"시험문제", icon:"📄", color:"#791F1F", bg:"#FCEBEB"},
  {id:"other",     label:"기타",     icon:"💬", color:"#888780", bg:"#F1EFE8"},
];

function CatBadge({catId,size=12}){
  const c=QNA_CATEGORIES.find(x=>x.id===catId)||QNA_CATEGORIES[QNA_CATEGORIES.length-1];
  return(
    <span style={{fontSize:size,padding:"2px 8px",borderRadius:99,background:c.bg,color:c.color,fontWeight:500,flexShrink:0}}>
      {c.icon} {c.label}
    </span>
  );
}

// ════════════════════════════════════════════════
// 학생 Q&A
// ════════════════════════════════════════════════
function StudentQnA({student}){
  const [questions,setQuestions] = useState([]);
  const [loading,setLoading]     = useState(true);
  const [showForm,setShowForm]   = useState(false);
  const [form,setForm]           = useState({title:"",content:"",category:"grammar"});
  const [selQ,setSelQ]           = useState(null);
  const [successMsg,setSuccessMsg] = useState("");
  const [filterCat,setFilterCat] = useState("all");

  const grouped={};
  const filtered=filterCat==="all"?questions:questions.filter(q=>q.category===filterCat);
  filtered.forEach(q=>{
    const d=q.created_at?.split("T")[0]||"날짜없음";
    if(!grouped[d])grouped[d]=[];
    grouped[d].push(q);
  });
  const dateList=Object.keys(grouped).sort().reverse();

  const load=async()=>{
    const {data}=await supabase.from("questions")
      .select("*").eq("student_id",student.id).order("created_at",{ascending:false});
    setQuestions(data||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[student.id]);

  const submit=async()=>{
    if(!form.title.trim()){alert("제목을 입력해주세요.");return;}
    if(!form.content.trim()){alert("내용을 입력해주세요.");return;}
    const {data,error}=await supabase.from("questions").insert({
      student_id:student.id,student_name:student.name,cls:student.cls,
      title:form.title,content:form.content,category:form.category,
    }).select().single();
    if(error){alert("오류가 발생했습니다.");return;}
    setQuestions(prev=>[data,...prev]);
    setForm({title:"",content:"",category:"grammar"});
    setShowForm(false);
    setSuccessMsg("질문이 등록되었습니다! 선생님이 확인 후 답변해드릴게요 😊");
    setTimeout(()=>setSuccessMsg(""),4000);
  };

  const unanswered=questions.filter(q=>!q.answer).length;
  const answered=questions.filter(q=>q.answer).length;

  if(loading) return <div style={{textAlign:"center",padding:"2rem",color:"#888780",fontSize:13}}>불러오는 중...</div>;

  if(selQ){
    return(
      <div>
        <button onClick={()=>setSelQ(null)} style={{fontSize:13,color:"#888780",background:"transparent",border:"none",cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:4}}>← 목록으로</button>
        <div style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"1.25rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
              <CatBadge catId={selQ.category}/>
              <span style={{fontSize:11,color:"#888780"}}>{selQ.created_at?.split("T")[0]}</span>
              {!selQ.answer&&<Badge label="답변 대기" type="amber"/>}
              {selQ.answer&&<Badge label="답변 완료" type="green"/>}
            </div>
            <div style={{fontSize:15,fontWeight:500,color:"#2C2C2A",marginBottom:10}}>{selQ.title}</div>
            <div style={{fontSize:13,color:"#5F5E5A",lineHeight:1.8,background:"#F1EFE8",borderRadius:8,padding:"12px 14px"}}>{selQ.content}</div>
          </div>
          {selQ.answer?(
            <div style={{borderTop:"0.5px solid #D3D1C7",padding:"1.25rem",background:"#EAF3DE"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <Badge label="선생님 답변" type="green"/>
                <span style={{fontSize:11,color:"#888780"}}>{selQ.answered_at?.split("T")[0]}</span>
              </div>
              <div style={{fontSize:13,color:"#2C2C2A",lineHeight:1.8}}>{selQ.answer}</div>
            </div>
          ):(
            <div style={{borderTop:"0.5px solid #D3D1C7",padding:"1.25rem",background:"#FAEEDA",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:20}}>⏳</span>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:"#633806"}}>답변 대기 중</div>
                <div style={{fontSize:12,color:"#888780",marginTop:2}}>선생님이 곧 답변해드릴 거예요!</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return(
    <div>
      <SuccessBox msg={successMsg}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
        <KpiCard label="전체 질문" value={questions.length+"개"} sub="누적"/>
        <KpiCard label="답변 대기" value={unanswered+"개"} sub="" valueColor={unanswered>0?"#BA7517":"#888780"}/>
        <KpiCard label="답변 완료" value={answered+"개"} sub="" valueColor="#27500A"/>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <BtnPrimary onClick={()=>setShowForm(!showForm)}>{showForm?"취소":"✏️ 질문하기"}</BtnPrimary>
      </div>

      {/* 질문 폼 */}
      {showForm&&(
        <Card mb={16}>
          <SectionTitle>새 질문 작성</SectionTitle>
          {/* 카테고리 선택 */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:"#888780",marginBottom:8}}>질문 유형 선택 *</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
              {QNA_CATEGORIES.map(c=>(
                <button key={c.id} onClick={()=>setForm({...form,category:c.id})}
                  style={{padding:"8px 4px",borderRadius:8,cursor:"pointer",border:`1.5px solid ${form.category===c.id?c.color:"#D3D1C7"}`,background:form.category===c.id?c.bg:"white",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all 0.15s"}}>
                  <span style={{fontSize:18}}>{c.icon}</span>
                  <span style={{fontSize:11,fontWeight:form.category===c.id?500:400,color:form.category===c.id?c.color:"#5F5E5A"}}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:12,color:"#888780",marginBottom:4}}>제목 *</div>
            <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
              placeholder="예: 관계대명사 which vs that 차이가 뭔가요?"
              style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:"#888780",marginBottom:4}}>내용 *</div>
            <textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})}
              placeholder="질문 내용을 자세히 써주세요. 어떤 부분이 헷갈리는지, 어떤 문제에서 막혔는지 등을 적어주세요."
              rows={4} style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",resize:"vertical",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <BtnSecondary onClick={()=>setShowForm(false)}>취소</BtnSecondary>
            <BtnPrimary onClick={submit}>등록하기</BtnPrimary>
          </div>
        </Card>
      )}

      {/* 카테고리 필터 */}
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        <button onClick={()=>setFilterCat("all")}
          style={{fontSize:11,padding:"4px 10px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:filterCat==="all"?"#888780":"#D3D1C7",background:filterCat==="all"?"#F1EFE8":"transparent",color:filterCat==="all"?"#2C2C2A":"#888780"}}>
          전체
        </button>
        {QNA_CATEGORIES.map(c=>(
          <button key={c.id} onClick={()=>setFilterCat(c.id)}
            style={{fontSize:11,padding:"4px 10px",borderRadius:99,cursor:"pointer",border:`0.5px solid ${filterCat===c.id?c.color:"#D3D1C7"}`,background:filterCat===c.id?c.bg:"transparent",color:filterCat===c.id?c.color:"#888780",fontWeight:filterCat===c.id?500:400}}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* 날짜별 목록 */}
      {filtered.length===0?(
        <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13,background:"white",borderRadius:12,border:"0.5px solid #D3D1C7"}}>
          {filterCat==="all"?"아직 질문이 없어요. 궁금한 게 있으면 언제든 질문해주세요! 😊":`${QNA_CATEGORIES.find(c=>c.id===filterCat)?.label} 관련 질문이 없어요`}
        </div>
      ):dateList.map(d=>(
        <div key={d} style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:500,color:"#888780",marginBottom:8,paddingLeft:4}}>{d}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {grouped[d].map(q=>(
              <div key={q.id} onClick={()=>setSelQ(q)}
                style={{background:"white",border:`0.5px solid ${!q.answer?"#EF9F27":"#97C459"}`,borderRadius:10,padding:"12px 14px",cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"}
                onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                  <CatBadge catId={q.category}/>
                  <span style={{fontSize:11,color:"#888780",marginLeft:"auto"}}>{q.created_at?.split("T")[1]?.slice(0,5)}</span>
                  {q.answer?<Badge label="답변 완료" type="green"/>:<Badge label="대기 중" type="amber"/>}
                </div>
                <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A",marginBottom:3}}>{q.title}</div>
                <div style={{fontSize:11,color:"#888780",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.content}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════
// AI 채팅 (학생 전용)
// ════════════════════════════════════════════════
// ── AI 채팅 (홍규에게 물어보기) ──
function AIChatTab({student}){
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const [history,setHistory]=useState([]);
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,aiLoading]);
  const send=async()=>{
    const text=input.trim();
    if(!text||aiLoading)return;
    setInput("");
    setMessages(prev=>[...prev,{id:Date.now()+"u",role:"user",content:text,time:new Date().toISOString()}]);
    setAiLoading(true);
    try{
      const newHist=[...history,{role:"user",content:text}];
      const resp=await fetch("/.netlify/functions/claude-proxy",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,
          system:"당신은 박홍규 영어학원의 AI 영어 강사입니다. 고등학생의 영어 질문에 친절하고 명확하게 답변해주세요. 문법, 어휘, 독해, 수능 영어 모두 OK. 답변은 한국어로 하되 영어 예시는 영어로.",
          messages:newHist})
      });
      if(resp.ok){
        const r=await resp.json();
        const aiText=r.content?.[0]?.text||"죄송해요, 답변 생성에 실패했어요.";
        setMessages(prev=>[...prev,{id:Date.now()+"a",role:"ai",content:aiText,time:new Date().toISOString()}]);
        setHistory([...newHist,{role:"assistant",content:aiText}]);
      }
    }catch(e){setMessages(prev=>[...prev,{id:Date.now()+"e",role:"ai",content:"네트워크 오류가 발생했어요.",time:new Date().toISOString()}]);}
    setAiLoading(false);
  };
  const fmt=(iso)=>{if(!iso)return"";const d=new Date(iso);return(d.getMonth()+1)+"/"+d.getDate()+" "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");};
  return(
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 240px)",minHeight:350}}>
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12,paddingBottom:8}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#2D5BE3,#5B8DEF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🤖</div>
          <div><div style={{fontSize:11,color:"#888780",marginBottom:4}}>AI 홍규</div>
          <div style={{background:"white",borderRadius:"0 12px 12px 12px",padding:"10px 14px",maxWidth:260,border:"0.5px solid #D3D1C7",fontSize:13,color:"#2C2C2A",lineHeight:1.7}}>안녕하세요 {student.name}님! 영어 관련 질문을 편하게 해주세요 😊</div></div>
        </div>
        {messages.map(msg=>(
          msg.role==="user"?(
            <div key={msg.id} style={{display:"flex",justifyContent:"flex-end",alignItems:"flex-end",gap:6}}>
              <span style={{fontSize:10,color:"#888780",flexShrink:0}}>{fmt(msg.time)}</span>
              <div style={{background:"#185FA5",borderRadius:"12px 0 12px 12px",padding:"10px 14px",maxWidth:240,fontSize:13,color:"white",lineHeight:1.7,wordBreak:"break-word"}}>{msg.content}</div>
            </div>
          ):(
            <div key={msg.id} style={{display:"flex",alignItems:"flex-start",gap:8}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#2D5BE3,#5B8DEF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🤖</div>
              <div style={{maxWidth:260}}>
                <div style={{fontSize:11,color:"#888780",marginBottom:4}}>AI 홍규 · {fmt(msg.time)}</div>
                <div style={{background:"white",borderRadius:"0 12px 12px 12px",padding:"10px 14px",border:"0.5px solid #D3D1C7",fontSize:13,color:"#2C2C2A",lineHeight:1.7,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{msg.content}</div>
              </div>
            </div>
          )
        ))}
        {aiLoading&&(
          <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#2D5BE3,#5B8DEF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🤖</div>
            <div style={{background:"white",borderRadius:"0 12px 12px 12px",padding:"12px 16px",border:"0.5px solid #D3D1C7",display:"flex",gap:4,alignItems:"center"}}>
              <style>{"@keyframes db{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}.db{width:7px;height:7px;border-radius:50%;background:#888780;animation:db 1.4s infinite ease-in-out;display:inline-block;margin:0 2px}.db:nth-child(1){animation-delay:-0.32s}.db:nth-child(2){animation-delay:-0.16s}"}</style>
              <div className="db"/><div className="db"/><div className="db"/>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      <div style={{paddingTop:8,flexShrink:0}}>
        <div style={{display:"flex",gap:8,alignItems:"flex-end",background:"white",borderRadius:24,padding:"8px 8px 8px 16px",border:"0.5px solid #D3D1C7",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="영어 질문을 입력하세요... (Enter로 전송)" rows={1} style={{flex:1,border:"none",outline:"none",resize:"none",fontSize:13,color:"#2C2C2A",background:"transparent",lineHeight:1.5,maxHeight:80,overflowY:"auto"}}/>
          <button onClick={send} disabled={!input.trim()||aiLoading} style={{width:36,height:36,borderRadius:"50%",border:"none",background:input.trim()&&!aiLoading?"#185FA5":"#D3D1C7",color:"white",cursor:input.trim()&&!aiLoading?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>➤</button>
        </div>
      </div>
    </div>
  );
}

// ── AI 변형문제 ──
// ── AI 변형문제 (저장된 문제 랜덤 출제) ──function AIVariantTab({student}){  const [passages,setPassages]=useState([]);  const [selPassage,setSelPassage]=useState(null);  const [questions,setQuestions]=useState([]);  const [myAns,setMyAns]=useState({});  const [result,setResult]=useState(null);  const [loading,setLoading]=useState(false);  const [step,setStep]=useState("list");  useEffect(()=>{    supabase.from("passages").select("*").order("created_at",{ascending:false}).then(({data})=>setPassages(data||[]));  },[]);  const startQuiz=async(passage)=>{    setSelPassage(passage);    setLoading(true);    const {data}=await supabase.from("variant_questions").select("*").eq("passage_id",passage.id);    if(!data||data.length===0){alert("아직 이 지문의 변형문제가 없어요!");setLoading(false);return;}    const shuffled=[...data].sort(()=>Math.random()-0.5).slice(0,Math.min(3,data.length));    setQuestions(shuffled);setMyAns({});setResult(null);setStep("quiz");setLoading(false);  };  const grade=()=>{    let correct=0;    questions.forEach((q,i)=>{if(myAns[i]===q.answer)correct++;});    setResult({correct,total:questions.length,score:Math.round(correct/questions.length*100)});    setStep("result");  };  if(step==="list") return(    <div>      <div style={{fontSize:14,fontWeight:600,color:"#2C2C2A",marginBottom:4}}>📄 지문 선택</div>      <div style={{fontSize:12,color:"#888780",marginBottom:12}}>지문을 선택하면 변형문제 3개가 랜덤으로 출제돼요!</div>      {passages.length===0?(        <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13,background:"white",borderRadius:12,border:"0.5px solid #D3D1C7"}}>아직 등록된 지문이 없어요<br/>선생님이 업로드하면 나타나요!</div>      ):(        <div style={{display:"flex",flexDirection:"column",gap:8}}>          {passages.map(p=>(            <div key={p.id} onClick={()=>!loading&&startQuiz(p)}              style={{background:"white",borderRadius:12,padding:"14px 16px",border:"0.5px solid #D3D1C7",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}              onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"} onMouseLeave={e=>e.currentTarget.style.background="white"}>              <div>                <div style={{fontSize:14,fontWeight:600,color:"#2C2C2A"}}>{p.title}</div>                <div style={{fontSize:11,color:"#888780",marginTop:3}}>{p.cls==="전체"?"전체 공개":p.cls+"반"}</div>              </div>              <span style={{fontSize:13,color:"#185FA5",fontWeight:500}}>{loading?"로딩...":"풀기 →"}</span>            </div>          ))}        </div>      )}    </div>  );  if(step==="quiz") return(    <div>      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>        <button onClick={()=>setStep("list")} style={{background:"transparent",border:"none",fontSize:18,cursor:"pointer",color:"#888780"}}>←</button>        <div>          <div style={{fontSize:14,fontWeight:600,color:"#2C2C2A"}}>{selPassage?.title}</div>          <div style={{fontSize:11,color:"#888780"}}>총 {questions.length}문제 (랜덤 출제)</div>        </div>      </div>      {questions.map((q,i)=>(        <div key={i} style={{background:"#F1EFE8",borderRadius:10,padding:"14px",marginBottom:14}}>          <div style={{fontSize:11,color:"#888780",marginBottom:6}}>{q.question_type}</div>          <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A",marginBottom:12,lineHeight:1.7}}>{i+1}. {q.question}</div>          <div style={{display:"flex",flexDirection:"column",gap:8}}>            {(q.choices||[]).map((c,j)=>(              <button key={j} onClick={()=>setMyAns(prev=>({...prev,[i]:j+1}))}                style={{padding:"10px 14px",borderRadius:8,cursor:"pointer",border:`1.5px solid ${myAns[i]===j+1?"#185FA5":"#D3D1C7"}`,background:myAns[i]===j+1?"#E6F1FB":"white",color:myAns[i]===j+1?"#185FA5":"#2C2C2A",textAlign:"left",fontSize:13,lineHeight:1.6}}>                {c}              </button>            ))}          </div>        </div>      ))}      <BtnPrimary onClick={grade} style={{width:"100%",padding:"12px"}} disabled={Object.keys(myAns).length<questions.length}>채점하기</BtnPrimary>    </div>  );  return(    <div>      <div style={{textAlign:"center",marginBottom:20}}>        <div style={{fontSize:48,fontWeight:700,color:result.score>=80?"#27500A":result.score>=60?"#BA7517":"#E24B4A"}}>{result.score}점</div>        <div style={{fontSize:14,color:"#888780",marginBottom:4}}>{result.correct}/{result.total}개 정답</div>        <div style={{fontSize:13,color:"#888780"}}>{selPassage?.title}</div>      </div>      {questions.map((q,i)=>(        <div key={i} style={{borderRadius:10,padding:"14px",marginBottom:12,background:myAns[i]===q.answer?"#EAF3DE":"#FCEBEB",border:`1px solid ${myAns[i]===q.answer?"#97C459":"#F09595"}`}}>          <div style={{fontSize:11,color:"#888780",marginBottom:4}}>{q.question_type}</div>          <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A",marginBottom:6}}>{i+1}. {q.question}</div>          <div style={{fontSize:12,color:"#888780",marginBottom:3}}>내 답: {(q.choices||[])[(myAns[i]||1)-1]}</div>          <div style={{fontSize:12,color:"#27500A",marginBottom:6}}>정답: {(q.choices||[])[q.answer-1]}</div>          {q.explanation&&<div style={{fontSize:12,color:"#5F5E5A",lineHeight:1.7,background:"rgba(255,255,255,0.7)",borderRadius:6,padding:"8px"}}>💡 {q.explanation}</div>}        </div>      ))}      <div style={{display:"flex",gap:8,marginTop:8}}>        <BtnSecondary onClick={()=>{setStep("list");setSelPassage(null);}} style={{flex:1}}>다른 지문</BtnSecondary>        <BtnPrimary onClick={()=>startQuiz(selPassage)} style={{flex:1}}>다시 풀기</BtnPrimary>      </div>    </div>  );}// ── AI 탭 통합 ──
function StudentAIChat({student}){
  const [subTab,setSubTab]=useState("chat");
  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[["chat","💬 홍규에게 물어보기"],["variant","📝 AI 변형문제"]].map(([id,label])=>(
          <button key={id} onClick={()=>setSubTab(id)}
            style={{flex:1,padding:"10px",borderRadius:10,cursor:"pointer",border:`1.5px solid ${subTab===id?"#185FA5":"#D3D1C7"}`,background:subTab===id?"#185FA5":"white",color:subTab===id?"white":"#888780",fontWeight:subTab===id?600:400,fontSize:13}}>
            {label}
          </button>
        ))}
      </div>
      {subTab==="chat"&&<AIChatTab student={student}/>}
      {subTab==="variant"&&<AIVariantTab student={student}/>}
    </div>
  );
}

// ════════════════════════════════════════════════
// 강사 Q&A 관리
// ════════════════════════════════════════════════
function TeacherQnA(){
  const [questions,setQuestions] = useState([]);
  const [loading,setLoading]     = useState(true);
  const [selQ,setSelQ]           = useState(null);
  const [answer,setAnswer]       = useState("");
  const [filterStatus,setFilterStatus] = useState("all");
  const [filterCls,setFilterCls] = useState("all");
  const [filterCat,setFilterCat] = useState("all");
  const [search,setSearch]       = useState("");
  const [successMsg,setSuccessMsg] = useState("");
  const [aiLoading,setAiLoading] = useState(false); // AI 답변 생성 중

  const getCatPrompt=(cat)=>{
    const styles={
      grammar:`문법 규칙을 정확하고 체계적으로 설명하세요. 핵심 규칙 → 예외 사항 → 수능/내신 출제 포인트 → 예문(영문+해석) 순으로 구성하세요. 혼동하기 쉬운 케이스를 짚어주세요.`,
      vocab:`단어의 정확한 의미, 품사, 어원(어근/접두사/접미사), 수능 빈출 유의어·반의어, 실제 수능/모의고사 예문을 포함해 설명하세요. 암기 팁도 추가하세요.`,
      reading:`지문 독해 전략(주제문 찾기, 논리 흐름, 빈칸 추론 등)을 수능 출제 유형에 맞춰 상세히 설명하세요. 실제 풀이 접근법을 단계별로 안내하세요.`,
      listening:`수능 듣기 유형별 전략(대화 목적, 숫자·날짜, 관계 파악 등)을 설명하세요. 핵심 표현과 오답 함정을 짚어주세요.`,
      writing:`영작 구조(주어·동사·목적어 배열), 수능 어법 포인트, 자주 틀리는 표현을 교정 예시와 함께 설명하세요.`,
      exam:`수능/내신 출제 경향 분석, 고득점 전략, 시간 배분, 오답 유형별 대처법을 체계적으로 안내하세요.`,
      homework:`과제의 핵심 개념을 설명하고 풀이 방향을 제시하세요. 직접 답을 주지 말고 스스로 풀 수 있도록 단계별 힌트를 주세요.`,
      other:`수능·내신을 준비하는 고등학생 수준에 맞게 정확하고 전문적으로 설명하세요.`,
    };
    return styles[cat]||styles.other;
  };

  const generateAiAnswer=async()=>{
    if(!selQ) return;
    setAiLoading(true);
    try{
      const catStyle=getCatPrompt(selQ.category);
      const systemPrompt=`당신은 수능 영어 전문 강사의 AI 어시스턴트입니다. 고등학생 학생의 영어 질문에 대한 전문적인 답변 초안을 작성하세요.

답변 원칙:
- 한국어로 작성 (영어 예문·문장은 영어 유지)
- 정확하고 체계적인 설명 (수능/내신 기준)
- 핵심을 먼저, 세부 설명은 그 다음
- ${catStyle}
- 필요시 ①②③ 또는 • 으로 구조화
- 끝에 "추가로 궁금한 점이 있으면 질문해요! 😊" 추가
- 분량: 200~400자 (너무 짧거나 길지 않게)`;

      const resp=await fetch("/.netlify/functions/claude-proxy",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1500,
          system:systemPrompt,
          messages:[{
            role:"user",
            content:`[질문 카테고리]: ${QNA_CATEGORIES.find(c=>c.id===selQ.category)?.label||"기타"}\n[질문 제목]: ${selQ.title}\n[질문 내용]: ${selQ.content}\n\n위 질문에 대한 전문적인 답변 초안을 작성해주세요.`
          }]
        })
      });
      if(!resp.ok){
        const err=await resp.json().catch(()=>({}));
        console.error("AI error:", err);
        alert(`AI 답변 생성 오류 (${resp.status})\nNetlify 배포 환경에서 사용해주세요.`);
        setAiLoading(false);
        return;
      }
      const data=await resp.json();
      const text=(data.content||[]).map(c=>c.text||"").join("");
      setAnswer(text.trim());
      setSuccessMsg("🤖 AI 초안이 생성됐어요! 내용을 확인하고 수정 후 발송해주세요.");
      setTimeout(()=>setSuccessMsg(""),5000);
    }catch(err){
      console.error("AI 답변 오류:",err);
      alert("AI 답변 생성 중 오류가 발생했어요.\nNetlify 배포 환경에서 사용해주세요.");
    }
    setAiLoading(false);
  };

  const filtered=questions.filter(q=>{
    if(filterStatus==="unanswered"&&q.answer) return false;
    if(filterStatus==="answered"&&!q.answer) return false;
    if(filterCls!=="all"&&q.cls!==filterCls) return false;
    if(filterCat!=="all"&&q.category!==filterCat) return false;
    if(search&&!q.student_name?.includes(search)&&!q.title?.includes(search)) return false;
    return true;
  });

  const grouped={};
  filtered.forEach(q=>{
    const d=q.created_at?.split("T")[0]||"날짜없음";
    if(!grouped[d])grouped[d]=[];
    grouped[d].push(q);
  });
  const dateList=Object.keys(grouped).sort().reverse();

  const load=async()=>{
    const {data}=await supabase.from("questions").select("*").order("created_at",{ascending:false});
    setQuestions(data||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  useEffect(()=>{
    const channel=supabase.channel("questions_changes")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"questions"},()=>load())
      .subscribe();
    return ()=>supabase.removeChannel(channel);
  },[]);

  const submitAnswer=async()=>{
    if(!answer.trim()){alert("답변을 입력해주세요.");return;}
    const {error}=await supabase.from("questions").update({
      answer:answer.trim(),answered_at:new Date().toISOString(),
    }).eq("id",selQ.id);
    if(error){alert("오류가 발생했습니다.");return;}
    const updated={...selQ,answer:answer.trim(),answered_at:new Date().toISOString()};
    setQuestions(prev=>prev.map(q=>q.id===selQ.id?updated:q));
    setSelQ(updated);
    setAnswer("");
    setSuccessMsg("답변이 등록되었습니다!");
    setTimeout(()=>setSuccessMsg(""),3000);
  };

  const deleteQ=async(id)=>{
    if(!window.confirm("이 질문을 삭제할까요?"))return;
    await supabase.from("questions").delete().eq("id",id);
    setQuestions(prev=>prev.filter(q=>q.id!==id));
    if(selQ?.id===id) setSelQ(null);
  };

  const unanswered=questions.filter(q=>!q.answer).length;
  const clsColor={A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"};

  // 카테고리별 통계
  const catStats=QNA_CATEGORIES.map(c=>({
    ...c,count:questions.filter(q=>q.category===c.id).length,
  })).filter(c=>c.count>0);

  if(loading) return <div style={{textAlign:"center",padding:"2rem",color:"#888780"}}>불러오는 중...</div>;

  if(selQ){
    return(
      <div>
        <SuccessBox msg={successMsg}/>
        <button onClick={()=>setSelQ(null)} style={{fontSize:13,color:"#888780",background:"transparent",border:"none",cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:4}}>← 목록으로</button>
        <div style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden",marginBottom:12}}>
          <div style={{background:"#F1EFE8",padding:"12px 16px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:AVATAR_COLORS[selQ.student_id%AVATAR_COLORS.length].bg,color:AVATAR_COLORS[selQ.student_id%AVATAR_COLORS.length].c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:500,flexShrink:0}}>{selQ.student_name?.slice(0,2)}</div>
            <div>
              <span style={{fontSize:13,fontWeight:500,color:"#2C2C2A"}}>{selQ.student_name}</span>
              <span style={{fontSize:11,color:"#888780",marginLeft:6}}>{selQ.cls}반</span>
            </div>
            <CatBadge catId={selQ.category}/>
            <span style={{fontSize:11,color:"#888780",marginLeft:"auto"}}>{selQ.created_at?.split("T")[0]}</span>
            {!selQ.answer&&<Badge label="답변 대기" type="amber"/>}
            {selQ.answer&&<Badge label="답변 완료" type="green"/>}
          </div>
          <div style={{padding:"1.25rem"}}>
            <div style={{fontSize:15,fontWeight:500,color:"#2C2C2A",marginBottom:12}}>{selQ.title}</div>
            <div style={{fontSize:13,color:"#5F5E5A",lineHeight:1.8,background:"#F1EFE8",borderRadius:8,padding:"12px 14px",marginBottom:16}}>{selQ.content}</div>
            {selQ.answer&&(
              <div style={{background:"#EAF3DE",borderRadius:8,padding:"12px 14px",marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:500,color:"#27500A",marginBottom:6}}>내 답변 · {selQ.answered_at?.split("T")[0]}</div>
                <div style={{fontSize:13,color:"#2C2C2A",lineHeight:1.8}}>{selQ.answer}</div>
              </div>
            )}
            <div>
              {/* AI 답변 생성 버튼 */}
              <div style={{background:"#E6F1FB",border:"0.5px solid #85B7EB",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:500,color:"#0C447C",marginBottom:2}}>🤖 AI 답변 초안 생성</div>
                    <div style={{fontSize:11,color:"#888780"}}>Claude AI가 질문 유형에 맞는 답변 초안을 작성해드려요. 검토 후 발송하세요.</div>
                  </div>
                  <button onClick={generateAiAnswer} disabled={aiLoading}
                    style={{fontSize:13,padding:"8px 16px",borderRadius:8,border:"none",background:aiLoading?"#D3D1C7":"#185FA5",color:"white",fontWeight:500,cursor:aiLoading?"default":"pointer",flexShrink:0,display:"flex",alignItems:"center",gap:6}}>
                    {aiLoading?"⏳ 생성 중...":"✨ AI 초안 생성"}
                  </button>
                </div>
              </div>
              <div style={{fontSize:12,color:"#888780",marginBottom:6}}>{selQ.answer?"답변 수정":"답변 작성"}</div>
              <textarea value={answer||selQ.answer||""} onChange={e=>setAnswer(e.target.value)}
                placeholder="AI 초안 생성 버튼을 누르거나 직접 입력하세요..."
                rows={6} style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:`0.5px solid ${answer&&!selQ.answer?"#185FA5":"#D3D1C7"}`,resize:"vertical",boxSizing:"border-box",marginBottom:8}}/>
              {answer&&!selQ.answer&&(
                <div style={{fontSize:11,color:"#185FA5",marginBottom:8}}>⚠️ AI 초안이 입력됐어요. 내용을 확인하고 수정 후 "답변 등록"을 눌러주세요.</div>
              )}
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <button onClick={()=>deleteQ(selQ.id)} style={{fontSize:12,padding:"6px 12px",borderRadius:8,border:"0.5px solid #F09595",background:"#FCEBEB",color:"#791F1F",cursor:"pointer"}}>질문 삭제</button>
                <div style={{display:"flex",gap:8}}>
                  {answer&&<BtnSecondary onClick={()=>setAnswer("")}>초안 지우기</BtnSecondary>}
                  <BtnPrimary onClick={submitAnswer}>{selQ.answer?"답변 수정":"답변 등록"}</BtnPrimary>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div>
      {/* KPI */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
        <KpiCard label="전체 질문" value={questions.length+"개"} sub="누적"/>
        <KpiCard label="답변 대기" value={unanswered+"개"} sub="확인 필요" valueColor={unanswered>0?"#E24B4A":"#888780"}/>
        <KpiCard label="답변 완료" value={(questions.length-unanswered)+"개"} sub="" valueColor="#27500A"/>
      </div>

      {/* 카테고리별 현황 */}
      {catStats.length>0&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          {catStats.map(c=>(
            <button key={c.id} onClick={()=>setFilterCat(filterCat===c.id?"all":c.id)}
              style={{fontSize:11,padding:"4px 10px",borderRadius:99,cursor:"pointer",border:`0.5px solid ${filterCat===c.id?c.color:"#D3D1C7"}`,background:filterCat===c.id?c.bg:"white",color:filterCat===c.id?c.color:"#888780",fontWeight:filterCat===c.id?500:400}}>
              {c.icon} {c.label} ({c.count})
            </button>
          ))}
        </div>
      )}

      {/* 필터 */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",gap:4}}>
          {[["all","전체"],["unanswered","대기 중"],["answered","답변 완료"]].map(([v,label])=>(
            <button key={v} onClick={()=>setFilterStatus(v)}
              style={{fontSize:12,padding:"5px 12px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:filterStatus===v?"#888780":"#D3D1C7",background:filterStatus===v?"#F1EFE8":"transparent",color:filterStatus===v?"#2C2C2A":"#888780",fontWeight:filterStatus===v?500:400}}>
              {label}
            </button>
          ))}
        </div>
        <ClassFilter value={filterCls} onChange={setFilterCls}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="학생 이름 or 제목 검색..."
          style={{fontSize:12,padding:"5px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",flex:1,minWidth:140}}/>
      </div>

      {/* 날짜별 목록 */}
      {filtered.length===0?(
        <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13}}>해당하는 질문이 없어요</div>
      ):dateList.map(d=>(
        <div key={d} style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:500,color:"#888780",marginBottom:8,paddingLeft:4,borderBottom:"0.5px solid #D3D1C7",paddingBottom:6}}>{d} ({grouped[d].length}개)</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {grouped[d].map(q=>(
              <div key={q.id} onClick={()=>{setSelQ(q);setAnswer(q.answer||"");}}
                style={{background:"white",border:`0.5px solid ${!q.answer?"#EF9F27":"#D3D1C7"}`,borderRadius:10,padding:"12px 14px",cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"}
                onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:AVATAR_COLORS[q.student_id%AVATAR_COLORS.length].bg,color:AVATAR_COLORS[q.student_id%AVATAR_COLORS.length].c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:500,flexShrink:0}}>{q.student_name?.slice(0,2)}</div>
                  <span style={{fontSize:13,fontWeight:500,color:"#2C2C2A"}}>{q.student_name}</span>
                  <Badge label={q.cls+"반"} type={clsColor[q.cls]||"gray"}/>
                  <CatBadge catId={q.category}/>
                  <span style={{fontSize:11,color:"#888780",marginLeft:"auto"}}>{q.created_at?.split("T")[1]?.slice(0,5)}</span>
                  {!q.answer?<Badge label="답변 대기" type="amber"/>:<Badge label="답변 완료" type="green"/>}
                </div>
                <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A",marginBottom:3}}>{q.title}</div>
                <div style={{fontSize:11,color:"#888780",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.content}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════
// 학생 클리닉 신청 내역
// ════════════════════════════════════════════════
function StudentClinicHistory({student}){
  const [requests,setRequests] = useState([]);
  const [loading,setLoading]   = useState(true);
  const [showForm,setShowForm] = useState(false);
  const [clinicForm,setClinicForm] = useState({date:"",time:"",reason:""});
  const [clinicDone,setClinicDone] = useState(false);
  const times=["14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"];

  const statusLabel={pending:"대기 중",confirmed:"확정",cancelled:"취소"};
  const statusType={pending:"amber",confirmed:"green",cancelled:"red"};

  const load=async()=>{
    const {data}=await supabase.from("clinic_requests")
      .select("*").eq("student_id",student.id).order("created_at",{ascending:false});
    setRequests(data||[]);
    setLoading(false);
  };

  useEffect(()=>{load();},[student.id]);

  const submit=async()=>{
    if(!clinicForm.date){alert("날짜를 선택해주세요.");return;}
    if(!clinicForm.time){alert("시간을 선택해주세요.");return;}
    const {data,error}=await supabase.from("clinic_requests").insert({
      student_id:student.id, student_name:student.name, cls:student.cls,
      date:clinicForm.date, time:clinicForm.time,
      reason:clinicForm.reason||"(사유 없음)", status:"pending",
    }).select().single();
    if(error){alert("신청 중 오류가 발생했습니다.");return;}
    setRequests(prev=>[data,...prev]);
    setClinicDone(true);
  };

  const pending  = requests.filter(r=>r.status==="pending").length;
  const confirmed= requests.filter(r=>r.status==="confirmed").length;

  if(loading) return <div style={{textAlign:"center",padding:"2rem",color:"#888780",fontSize:13}}>불러오는 중...</div>;

  return(
    <div>
      {/* 요약 KPI */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
        <KpiCard label="전체 신청" value={requests.length+"건"} sub="누적"/>
        <KpiCard label="대기 중" value={pending+"건"} sub="확인 중" valueColor={pending>0?"#BA7517":"#888780"}/>
        <KpiCard label="확정" value={confirmed+"건"} sub="일정 확정" valueColor="#27500A"/>
      </div>

      {/* 신청 버튼 */}
      <div style={{marginBottom:16}}>
        <BtnPrimary onClick={()=>{setShowForm(!showForm);setClinicDone(false);setClinicForm({date:"",time:"",reason:""});}}>
          {showForm?"취소":"+ 새 클리닉 신청"}
        </BtnPrimary>
      </div>

      {/* 신청 폼 */}
      {showForm&&(
        <Card mb={16}>
          {!clinicDone?(
            <>
              <SectionTitle>개별 클리닉 신청</SectionTitle>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:12,color:"#888780",marginBottom:6}}>희망 날짜</div>
                <input type="date" value={clinicForm.date} onChange={e=>setClinicForm({...clinicForm,date:e.target.value})}
                  style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:12,color:"#888780",marginBottom:6}}>희망 시간</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {times.map(t=>(
                    <button key={t} onClick={()=>setClinicForm({...clinicForm,time:t})}
                      style={{padding:"7px 12px",borderRadius:8,border:`0.5px solid ${clinicForm.time===t?"#0F6E56":"#D3D1C7"}`,background:clinicForm.time===t?"#EAF3DE":"transparent",color:clinicForm.time===t?"#085041":"#888780",fontSize:12,fontWeight:clinicForm.time===t?500:400,cursor:"pointer"}}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:12,color:"#888780",marginBottom:6}}>신청 사유 (선택)</div>
                <textarea value={clinicForm.reason} onChange={e=>setClinicForm({...clinicForm,reason:e.target.value})}
                  placeholder="예: 문법 파트 질문이 있어요" rows={3}
                  style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",resize:"none",boxSizing:"border-box"}}/>
              </div>
              <BtnPrimary onClick={submit} style={{width:"100%",padding:"11px"}}>신청하기</BtnPrimary>
            </>
          ):(
            <div style={{textAlign:"center",padding:"1.5rem 0"}}>
              <div style={{fontSize:32,marginBottom:8}}>✅</div>
              <div style={{fontSize:15,fontWeight:500,color:"#2C2C2A",marginBottom:4}}>신청 완료!</div>
              <div style={{fontSize:13,color:"#888780",marginBottom:16}}>
                <b>{clinicForm.date}</b> {clinicForm.time} 으로 신청됐어요.<br/>선생님 확인 후 확정 안내가 올 거예요.
              </div>
              <BtnSecondary onClick={()=>{setShowForm(false);setClinicDone(false);}}>닫기</BtnSecondary>
            </div>
          )}
        </Card>
      )}

      {/* 신청 내역 목록 */}
      {requests.length===0?(
        <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13,background:"white",borderRadius:12,border:"0.5px solid #D3D1C7"}}>
          아직 클리닉 신청 내역이 없어요
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {requests.map(r=>(
            <div key={r.id} style={{background:"white",border:`0.5px solid ${r.status==="pending"?"#EF9F27":r.status==="confirmed"?"#97C459":"#D3D1C7"}`,borderRadius:12,padding:"1rem"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:6}}>
                <div>
                  <div style={{fontSize:14,fontWeight:500,color:"#2C2C2A"}}>{r.date} {r.time}</div>
                  <div style={{fontSize:11,color:"#888780",marginTop:2}}>{new Date(r.created_at).toLocaleDateString("ko-KR")} 신청</div>
                </div>
                <Badge label={statusLabel[r.status]||r.status} type={statusType[r.status]||"gray"}/>
              </div>
              {r.reason&&r.reason!=="(사유 없음)"&&(
                <div style={{background:"#F1EFE8",borderRadius:6,padding:"8px 10px",fontSize:12,color:"#5F5E5A"}}>
                  {r.reason}
                </div>
              )}
              {r.status==="confirmed"&&(
                <div style={{marginTop:8,fontSize:12,color:"#27500A",background:"#EAF3DE",borderRadius:6,padding:"6px 10px"}}>
                  ✓ 일정이 확정됐어요!
                </div>
              )}
              {r.status==="cancelled"&&(
                <div style={{marginTop:8,fontSize:12,color:"#791F1F",background:"#FCEBEB",borderRadius:6,padding:"6px 10px"}}>
                  ✕ 취소된 신청이에요. 다시 신청해주세요.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════ 학생 OMR ════
function StudentOMR({student,autoKeyId,onAutoKeyUsed}){
  const [answerKeys,setAnswerKeys] = useState([]);
  const [selKey,setSelKey]         = useState(null);
  const [myAns,setMyAns]           = useState([]);
  const [result,setResult]         = useState(null);
  const [loading,setLoading]       = useState(true);
  const [history,setHistory]       = useState([]);
  const [viewTab,setViewTab]       = useState("omr");
  const [selHistory,setSelHistory] = useState(null);

  useEffect(()=>{
    const load=async()=>{
      const {data:keys}=await supabase.from("answer_keys").select("*").order("created_at",{ascending:false});
      setAnswerKeys(keys||[]);
      const {data:hist}=await supabase.from("omr_results").select("*")
        .eq("student_id",student.id).order("created_at",{ascending:false});
      setHistory(hist||[]);
      setLoading(false);
    };
    load();
  },[student.id]);

  // 과제물에서 채점하기 버튼으로 이동한 경우 자동 선택
  useEffect(()=>{
    if(autoKeyId&&answerKeys.length>0){
      const key=answerKeys.find(k=>k.id===autoKeyId);
      if(key){
        selectKey(key);
        setViewTab("omr");
        if(onAutoKeyUsed) onAutoKeyUsed();
      }
    }
  },[autoKeyId,answerKeys]);

  const selectKey=(key)=>{
    setSelKey(key);
    setMyAns(Array(key.q_count).fill(0));
    setResult(null);
  };

  const mark=(i,v)=>{
    if(result)return;
    setMyAns(prev=>{const a=[...prev];a[i]=a[i]===v?0:v;return a;});
  };

  const grade=async()=>{
    if(!selKey){alert("시험을 선택해주세요.");return;}
    if(myAns.every(a=>a===0)){alert("답안을 먼저 입력해주세요.");return;}
    const answers=selKey.answers;
    const correct=myAns.filter((v,i)=>v===answers[i]).length;
    const score=Math.round(correct/selKey.q_count*100);
    const wrong=myAns.map((v,i)=>v!==answers[i]?i+1:null).filter(Boolean);
    const res={correct,total:selKey.q_count,score,wrong};
    setResult(res);
    const {data:saved}=await supabase.from("omr_results").insert({
      student_id:student.id, student_name:student.name, cls:student.cls,
      answer_key_id:selKey.id, week:selKey.week, test_date:selKey.test_date, title:selKey.title||selKey.week,
      my_answers:myAns, score, correct, total:selKey.q_count, wrong,
    }).select().single();
    if(saved) setHistory(prev=>[saved,...prev]);

    // 모의고사/내신이면 exam_scores에 자동 저장
    if(selKey.exam_type==="모의고사"||selKey.exam_type==="내신"){
      const examType=selKey.exam_type==="모의고사"?"mock":"school";
      const grade=examType==="mock"
        ?score>=90?"1등급":score>=80?"2등급":score>=70?"3등급":score>=60?"4등급":score>=50?"5등급":score>=40?"6등급":score>=30?"7등급":score>=20?"8등급":"9등급"
        :"";
      await supabase.from("exam_scores").insert({
        student_id:student.id, student_name:student.name, cls:student.cls,
        exam_type:examType,
        exam_name:selKey.title||selKey.week,
        exam_date:selKey.test_date||new Date().toISOString().split("T")[0],
        subject:selKey.exam_subject||"영어",
        score, max_score:100, grade,
      });
    }
  };

  // 이미 제출한 시험 id 목록
  const submittedKeyIds = new Set(history.map(r=>r.answer_key_id));

  // 본인에게 공개된 시험만
  const myKeys=answerKeys.filter(k=>{
    if(k.target_students&&k.target_students.length>0) return k.target_students.includes(student.id);
    if(k.target_cls&&k.target_cls!=="전체") return k.target_cls.split(",").includes(student.cls);
    return true;
  });

  // 날짜별 기록 그룹
  const histByDate={};
  history.forEach(r=>{
    const d=r.test_date||r.created_at?.split("T")[0]||"날짜없음";
    if(!histByDate[d])histByDate[d]=[];
    histByDate[d].push(r);
  });
  const dateList=Object.keys(histByDate).sort().reverse();

  const pct=result?.score||0;
  const gradeLabel=pct>=90?"A":pct>=80?"B":pct>=70?"C":pct>=60?"D":"F";
  const gradeColor=pct>=90?"#27500A":pct>=80?"#0C447C":pct>=70?"#633806":"#791F1F";
  const gradeBg   =pct>=90?"#EAF3DE":pct>=80?"#E6F1FB":pct>=70?"#FAEEDA":"#FCEBEB";
  const barCol    =pct>=80?"#639922":pct>=65?"#BA7517":"#E24B4A";
  const chunkSize=15;
  const chunks=[];
  if(selKey){for(let i=0;i<selKey.q_count;i+=chunkSize)chunks.push([i,Math.min(i+chunkSize,selKey.q_count)]);}

  // 이미 제출한 시험의 기존 기록 가져오기
  const existingRecord = selKey ? history.find(r=>r.answer_key_id===selKey.id) : null;
  const isAlreadySubmitted = !!existingRecord;

  if(loading)return <div style={{textAlign:"center",padding:"2rem",color:"#888780",fontSize:13}}>불러오는 중...</div>;

  return(
    <div>
      <div style={{display:"flex",gap:4,marginBottom:16}}>
        {[["omr","OMR 채점"],["history",`내 기록 (${history.length}회)`]].map(([id,label])=>(
          <button key={id} onClick={()=>setViewTab(id)} style={{fontSize:12,padding:"5px 14px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:viewTab===id?"#888780":"#D3D1C7",background:viewTab===id?"#F1EFE8":"transparent",color:viewTab===id?"#2C2C2A":"#888780",fontWeight:viewTab===id?500:400}}>{label}</button>
        ))}
      </div>

      {viewTab==="omr"&&(
        <>
          {/* 과제물에서 넘어온 경우 안내 */}
          {selKey&&autoKeyId===null&&(
            <div style={{background:"#EAF3DE",border:"0.5px solid #97C459",borderRadius:8,padding:"8px 14px",marginBottom:12,fontSize:12,color:"#27500A",display:"flex",alignItems:"center",gap:8}}>
              📝 <b>{selKey.title||selKey.week}</b> 시험이 선택됐어요. 아래에서 바로 답안을 입력하세요!
            </div>
          )}
          {/* 시험 선택 */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:500,color:"#888780",marginBottom:8}}>시험 선택</div>
            {myKeys.length===0?(
              <div style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:12,padding:"2rem",textAlign:"center",color:"#888780",fontSize:13}}>
                아직 등록된 시험이 없어요
              </div>
            ):(
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {myKeys.map(k=>{
                  const submitted=submittedKeyIds.has(k.id);
                  return(
                    <button key={k.id} onClick={()=>selectKey(k)}
                      style={{padding:"8px 14px",borderRadius:8,cursor:"pointer",border:`0.5px solid ${selKey?.id===k.id?"#185FA5":submitted?"#97C459":"#D3D1C7"}`,background:selKey?.id===k.id?"#E6F1FB":submitted?"#EAF3DE":"white",textAlign:"left",position:"relative"}}>
                      <div style={{fontSize:13,fontWeight:500,color:selKey?.id===k.id?"#185FA5":submitted?"#27500A":"#2C2C2A"}}>{k.title||k.week}</div>
                      <div style={{fontSize:11,color:"#888780",marginTop:2}}>📅 {k.test_date} · {k.q_count}문항</div>
                      {submitted&&<div style={{fontSize:10,color:"#27500A",marginTop:2,fontWeight:500}}>✓ 제출 완료</div>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selKey&&(
            isAlreadySubmitted ? (
              /* ── 이미 제출한 시험 — 본인 답안 읽기 전용 표시 ── */
              <div>
                <div style={{background:"#EAF3DE",border:"0.5px solid #97C459",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#27500A",display:"flex",alignItems:"center",gap:8}}>
                  ✓ 이미 제출한 시험이에요. 수정이 필요하면 선생님께 문의하세요.
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {/* 제출한 답안 읽기 전용 */}
                  <Card mb={0}>
                    <SectionTitle>내가 제출한 답안</SectionTitle>
                    <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(chunks.length,3)},1fr)`,gap:10}}>
                      {chunks.map(([start,end])=>(
                        <div key={start}>
                          <div style={{fontSize:10,fontWeight:500,color:"#888780",marginBottom:4}}>{start+1}~{end}번</div>
                          {Array.from({length:end-start},(_,j)=>{
                            const i=start+j;
                            const myAnsArr=existingRecord.my_answers||[];
                            const answers=selKey.answers;
                            return(
                              <div key={i} style={{display:"flex",alignItems:"center",gap:3,marginBottom:3}}>
                                <span style={{fontSize:10,color:"#888780",width:20,textAlign:"right",flexShrink:0}}>{i+1}</span>
                                <div style={{display:"flex",gap:2}}>
                                  {[1,2,3,4,5].map(v=>{
                                    const isSelected=myAnsArr[i]===v;
                                    let bg="transparent",color="#888780",border="0.5px solid #D3D1C7";
                                    if(isSelected&&answers[i]===v){bg="#EAF3DE";color="#27500A";border="0.5px solid #97C459";}
                                    else if(isSelected&&answers[i]!==v){bg="#FCEBEB";color="#791F1F";border="0.5px solid #F09595";}
                                    else if(!isSelected&&answers[i]===v&&myAnsArr[i]!==0){bg="#EAF3DE";color="#27500A";border="0.5px solid #97C459";}
                                    return(
                                      <div key={v} style={{width:20,height:16,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,background:bg,color,border,cursor:"default"}}>
                                        {v}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </Card>
                  {/* 결과 */}
                  <Card mb={0}>
                    {(()=>{
                      const p=existingRecord.score;
                      const gl=p>=90?"A":p>=80?"B":p>=70?"C":p>=60?"D":"F";
                      const gc=p>=90?"#27500A":p>=80?"#0C447C":p>=70?"#633806":"#791F1F";
                      const gb=p>=90?"#EAF3DE":p>=80?"#E6F1FB":p>=70?"#FAEEDA":"#FCEBEB";
                      const bc=p>=80?"#639922":p>=65?"#BA7517":"#E24B4A";
                      return(
                        <>
                          <div style={{textAlign:"center",padding:"0.5rem 0 1rem"}}>
                            <div style={{fontSize:52,fontWeight:500,color:gc,lineHeight:1}}>{p}</div>
                            <div style={{fontSize:14,color:"#888780",marginBottom:8}}>점</div>
                            <div style={{display:"inline-block",padding:"4px 16px",borderRadius:99,background:gb,color:gc,fontWeight:500,fontSize:15}}>{gl}등급</div>
                          </div>
                          <div style={{fontSize:12,color:"#888780",textAlign:"center",marginBottom:12}}>{existingRecord.correct} / {existingRecord.total}문항 정답</div>
                          <div style={{height:8,background:"#F1EFE8",borderRadius:99,overflow:"hidden",marginBottom:12}}>
                            <div style={{width:p+"%",height:"100%",background:bc,borderRadius:99}}/>
                          </div>
                          <div style={{display:"flex",gap:8,marginBottom:12}}>
                            <div style={{flex:1,background:"#EAF3DE",borderRadius:8,padding:"8px",textAlign:"center"}}>
                              <div style={{fontSize:11,color:"#27500A"}}>정답</div>
                              <div style={{fontSize:20,fontWeight:500,color:"#27500A"}}>{existingRecord.correct}</div>
                            </div>
                            <div style={{flex:1,background:"#FCEBEB",borderRadius:8,padding:"8px",textAlign:"center"}}>
                              <div style={{fontSize:11,color:"#791F1F"}}>오답</div>
                              <div style={{fontSize:20,fontWeight:500,color:"#791F1F"}}>{existingRecord.wrong?.length||0}</div>
                            </div>
                          </div>
                          {existingRecord.wrong?.length>0&&(
                            <>
                              <SectionTitle>틀린 문항</SectionTitle>
                              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                                {existingRecord.wrong.map(qn=>(
                                  <div key={qn} style={{padding:"4px 10px",borderRadius:6,background:"#FCEBEB",fontSize:12,color:"#791F1F",fontWeight:500}}>
                                    {qn}번 <span style={{fontSize:10,color:"#888780"}}>정답:{selKey.answers[qn-1]}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </Card>
                </div>
              </div>
            ) : (
              /* ── 아직 제출 안한 시험 — 답안 입력 가능 ── */
              <div>
                <Card mb={12}>
                  <SectionTitle>내 답안 입력</SectionTitle>
                  <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
                    {Array.from({length:selKey.q_count},(_,i)=>{
                      const answers=selKey.answers;
                      return(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",borderRadius:8,background:result?(myAns[i]===answers[i]?"#EAF3DE":myAns[i]!==0?"#FCEBEB":"#F1EFE8"):"#F1EFE8"}}>
                          <span style={{fontSize:13,fontWeight:600,color:"#888780",width:24,textAlign:"right",flexShrink:0}}>{i+1}</span>
                          <div style={{display:"flex",gap:6,flex:1}}>
                            {[1,2,3,4,5].map(v=>{
                              const isSelected=myAns[i]===v;
                              let bg="white",color="#888780",border="0.5px solid #D3D1C7",fw=400;
                              if(result){
                                if(isSelected&&answers[i]===v){bg="#EAF3DE";color="#27500A";border="1.5px solid #97C459";fw=700;}
                                else if(isSelected&&answers[i]!==v){bg="#FCEBEB";color="#791F1F";border="1.5px solid #F09595";fw=700;}
                                else if(!isSelected&&answers[i]===v){bg="#EAF3DE";color="#27500A";border="1.5px solid #97C459";fw=600;}
                              } else if(isSelected){bg="#185FA5";color="white";border="1.5px solid #185FA5";fw=700;}
                              return(
                                <div key={v} onClick={()=>mark(i,v)}
                                  style={{flex:1,height:36,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,cursor:result?"default":"pointer",background:bg,color,border,fontWeight:fw,transition:"all 0.1s"}}>
                                  {v}
                                </div>
                              );
                            })}
                          </div>
                          {result&&(
                            <span style={{fontSize:11,flexShrink:0,color:myAns[i]===answers[i]?"#27500A":"#791F1F"}}>
                              {myAns[i]===answers[i]?"✓":`정답:${answers[i]}`}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {!result&&<BtnPrimary onClick={grade} style={{width:"100%",padding:"10px"}}>채점하기 (1회만 가능)</BtnPrimary>}
                  {result&&<div style={{fontSize:12,color:"#888780",textAlign:"center",marginTop:8,padding:"6px",background:"#F1EFE8",borderRadius:6}}>채점 완료! 수정이 필요하면 선생님께 문의하세요.</div>}
                </Card>
                <div>
                  {!result?(
                    <div style={{textAlign:"center",padding:"3rem 0",color:"#888780",fontSize:13}}>답안을 입력하고<br/>채점하기를 눌러주세요</div>
                  ):(
                    <Card mb={0}>
                      <div style={{textAlign:"center",padding:"0.5rem 0 1.5rem"}}>
                        <div style={{fontSize:52,fontWeight:500,color:gradeColor,lineHeight:1}}>{pct}</div>
                        <div style={{fontSize:14,color:"#888780",marginBottom:8}}>점</div>
                        <div style={{display:"inline-block",padding:"4px 16px",borderRadius:99,background:gradeBg,color:gradeColor,fontWeight:500,fontSize:15}}>{gradeLabel}등급</div>
                      </div>
                      <div style={{fontSize:12,color:"#888780",textAlign:"center",marginBottom:12}}>{result.correct} / {result.total}문항 정답</div>
                      <div style={{height:8,background:"#F1EFE8",borderRadius:99,overflow:"hidden",marginBottom:12}}>
                        <div style={{width:pct+"%",height:"100%",background:barCol,borderRadius:99}}/>
                      </div>
                      <div style={{display:"flex",gap:8,marginBottom:12}}>
                        <div style={{flex:1,background:"#EAF3DE",borderRadius:8,padding:"8px",textAlign:"center"}}>
                          <div style={{fontSize:11,color:"#27500A"}}>정답</div>
                          <div style={{fontSize:20,fontWeight:500,color:"#27500A"}}>{result.correct}</div>
                        </div>
                        <div style={{flex:1,background:"#FCEBEB",borderRadius:8,padding:"8px",textAlign:"center"}}>
                          <div style={{fontSize:11,color:"#791F1F"}}>오답</div>
                          <div style={{fontSize:20,fontWeight:500,color:"#791F1F"}}>{result.wrong.length}</div>
                        </div>
                      </div>
                      {result.wrong.length>0?(
                        <>
                          <SectionTitle>틀린 문항 ({result.wrong.length}개)</SectionTitle>
                          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                            {result.wrong.map(qn=>(
                              <div key={qn} style={{padding:"4px 10px",borderRadius:6,background:"#FCEBEB",fontSize:12,color:"#791F1F",fontWeight:500}}>
                                {qn}번 <span style={{fontSize:10,color:"#888780"}}>정답:{selKey.answers[qn-1]}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      ):(
                        <div style={{textAlign:"center",padding:"0.5rem",fontSize:16}}>만점! 🎉</div>
                      )}
                    </Card>
                  )}
                </div>
              </div>
            )
          )}
        </>
      )}

      {/* ── 내 기록 탭 ── */}
      {viewTab==="history"&&(
        <div style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:16}}>
          <div>
            <div style={{fontSize:12,fontWeight:500,color:"#888780",marginBottom:8}}>날짜 선택</div>
            {dateList.length===0?(
              <div style={{fontSize:13,color:"#888780"}}>기록 없음</div>
            ):dateList.map(d=>{
              const recs=histByDate[d];
              const best=Math.max(...recs.map(r=>r.score));
              const isSelected=selHistory===d;
              return(
                <div key={d} onClick={()=>setSelHistory(d)}
                  style={{padding:"10px 12px",borderRadius:8,marginBottom:6,cursor:"pointer",border:`0.5px solid ${isSelected?"#185FA5":"#D3D1C7"}`,background:isSelected?"#E6F1FB":"white"}}>
                  <div style={{fontSize:12,fontWeight:500,color:isSelected?"#185FA5":"#2C2C2A"}}>{d}</div>
                  <div style={{fontSize:11,color:"#888780",marginTop:2}}>{recs.map(r=>r.title||r.week).filter((v,i,a)=>a.indexOf(v)===i).join(", ")}</div>
                  <div style={{fontSize:11,color:"#888780"}}>{recs.length}회 · 최고 <b>{best}점</b></div>
                </div>
              );
            })}
          </div>
          <div>
            {!selHistory?(
              <div style={{textAlign:"center",padding:"3rem 0",color:"#888780",fontSize:13}}>날짜를 선택해주세요</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {histByDate[selHistory].map(r=>{
                  const p=r.score;
                  const gl=p>=90?"A":p>=80?"B":p>=70?"C":p>=60?"D":"F";
                  const gc=p>=90?"#27500A":p>=80?"#0C447C":p>=70?"#633806":"#791F1F";
                  const gb=p>=90?"#EAF3DE":p>=80?"#E6F1FB":p>=70?"#FAEEDA":"#FCEBEB";
                  const bc=p>=80?"#639922":p>=65?"#BA7517":"#E24B4A";
                  return(
                    <div key={r.id} style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:12,padding:"1rem"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                        <div>
                          <div style={{fontSize:14,fontWeight:500,color:"#2C2C2A"}}>{r.title||r.week}</div>
                          <div style={{fontSize:11,color:"#888780",marginTop:2}}>{r.test_date} · {new Date(r.created_at).toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"})} 채점</div>
                        </div>
                        <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                          <span style={{fontSize:28,fontWeight:500,color:gc}}>{p}</span>
                          <span style={{fontSize:12,color:"#888780"}}>점</span>
                          <span style={{padding:"2px 10px",borderRadius:99,background:gb,color:gc,fontWeight:500,fontSize:13,marginLeft:4}}>{gl}</span>
                        </div>
                      </div>
                      <div style={{height:6,background:"#F1EFE8",borderRadius:99,overflow:"hidden",marginBottom:8}}>
                        <div style={{width:p+"%",height:"100%",background:bc,borderRadius:99}}/>
                      </div>
                      <div style={{display:"flex",gap:12,fontSize:12,color:"#888780",marginBottom:r.wrong?.length>0?8:0}}>
                        <span>정답 <b style={{color:"#27500A"}}>{r.correct}</b>개</span>
                        <span>오답 <b style={{color:"#E24B4A"}}>{r.wrong?.length||0}</b>개</span>
                        <span>총 {r.total}문항</span>
                      </div>
                      {r.wrong?.length>0&&(
                        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>
                          {r.wrong.map(qn=>(
                            <span key={qn} style={{padding:"2px 8px",borderRadius:6,background:"#FCEBEB",fontSize:11,color:"#791F1F"}}>{qn}번</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// 학생용 모의고사/내신 성적 (본인만 + 전체 평균 비교)
// ════════════════════════════════════════════════
// 학생 성적 탭 — 강사 리포트 읽기 전용 버전
// ════════════════════════════════════════════════
function StudentReportView({student,attendanceData,scoresData}){
  const [clinicData,setClinicData]   = useState([]);
  const [omrData,setOmrData]         = useState([]);
  const [answerKeys,setAnswerKeys]   = useState([]);
  const [examScores,setExamScores]   = useState([]);
  const [comment,setComment]         = useState("");
  const [loading,setLoading]         = useState(true);
  const [trendTab,setTrendTab]       = useState("mock");
  const [statsModal,setStatsModal]   = useState(null);

  useEffect(()=>{
    Promise.all([
      supabase.from("clinic_requests").select("*").eq("student_id",student.id).order("created_at",{ascending:false}),
      supabase.from("omr_results").select("*").eq("student_id",student.id).order("created_at",{ascending:false}),
      supabase.from("answer_keys").select("*").order("test_date",{ascending:false}),
      supabase.from("exam_scores").select("*").order("exam_date",{ascending:true}),
    ]).then(([clinic,omr,keys,exams])=>{
      setClinicData(clinic.data||[]);
      setOmrData(omr.data||[]);
      setAnswerKeys(keys.data||[]);
      setExamScores(exams.data||[]);
      setLoading(false);
    });
  },[student.id]);

  // 통계 모달 열기 (모의고사/내신)
  const openExamStats=async(examName,examDate)=>{
    const {data}=await supabase.from("exam_scores").select("*").eq("exam_name",examName).eq("exam_date",examDate);
    if(!data||data.length===0) return;
    setStatsModal({
      keyData:{title:examName,test_date:examDate,q_count:data[0]?.max_score||100},
      allScores:data.map(r=>({id:r.id,student_id:r.student_id,student_name:r.student_name,cls:r.cls,score:r.score,pass:r.score/(r.max_score||100)>=0.7,max_score:r.max_score||100})),
      studentOnly:true,
      myStudentId:student.id,
    });
  };

  // 과제물(OMR) 통계
  const openHwStats=async(title,testDate)=>{
    const {data}=await supabase.from("omr_results").select("*").eq("title",title);
    const records=data&&data.length>0?data:[];
    if(records.length===0){
      const {data:d2}=await supabase.from("omr_results").select("*").eq("week",title);
      if(d2&&d2.length>0){
        setStatsModal({keyData:{title,test_date:testDate},allScores:d2.map(r=>({...r,pass:r.score>=70})),studentOnly:true,myStudentId:student.id});
        return;
      }
    }
    setStatsModal({keyData:{title,test_date:testDate},allScores:records.map(r=>({...r,pass:r.score>=70})),studentOnly:true,myStudentId:student.id});
  };

  // 단어시험 통계
  const openScoreStats=async(week)=>{
    const allScoreRecs=Object.values(scoresData).flat().filter(r=>r.week===week);
    setStatsModal({
      keyData:{title:week,test_date:week},
      allScores:allScoreRecs.map(r=>({...r,student_name:r.student_name,pass:r.pass})),
      studentOnly:true,
      myStudentId:student.id,
    });
  };

  const myAtt     = (attendanceData[student.id]||[]);
  const attCount  = myAtt.filter(r=>r.status==="O").length;
  const attTotal  = myAtt.length;
  const attPct    = attTotal>0?Math.round(attCount/attTotal*100):0;
  const lateCount = myAtt.filter(r=>r.status==="L").length;
  const myScores  = (scoresData[student.id]||[]).slice(0,10).reverse();
  const latestScore = myScores.length>0?myScores[myScores.length-1].score:null;
  const allWordTests = (scoresData[student.id]||[]);
  const passTotal   = allWordTests.filter(r=>r.pass).length;
  const wordTotal   = allWordTests.length;
  const confirmedClinics = clinicData.filter(r=>r.status==="confirmed").length;

  const mockScores   = examScores.filter(e=>e.student_id===student.id&&e.exam_type==="mock").map(e=>({label:e.exam_name,score:e.score,date:e.exam_date,grade:e.grade,subject:e.subject,id:e.id,max:e.max_score}));
  const schoolScores = examScores.filter(e=>e.student_id===student.id&&e.exam_type==="school").map(e=>({label:e.exam_name,score:e.score,date:e.exam_date,grade:e.grade,subject:e.subject,id:e.id,max:e.max_score}));
  const hwScores     = omrData.map(e=>({label:e.title||e.week,score:e.score,date:e.test_date,id:e.id,max:100}));
  const trendData    = trendTab==="mock"?mockScores:trendTab==="school"?schoolScores:hwScores;
  const trendAvg     = trendData.length>0?Math.round(trendData.reduce((a,b)=>a+b.score,0)/trendData.length):null;
  const trendMax     = trendData.length>0?Math.max(...trendData.map(d=>d.score)):null;
  const trendMin     = trendData.length>0?Math.min(...trendData.map(d=>d.score)):null;

  // ── 모의고사 반 내 등수 (가장 최근 시험 기준) ──
  const calcClsRank=(examType)=>{
    // 같은 반 학생들의 가장 최근 해당 유형 시험 점수 기준
    const myRecs=examScores.filter(e=>e.student_id===student.id&&e.exam_type===examType);
    if(myRecs.length===0) return null;
    // 가장 최근 시험명/날짜 찾기
    const latest=myRecs[myRecs.length-1];
    const sameExam=examScores.filter(e=>e.exam_type===examType&&e.exam_name===latest.exam_name&&e.exam_date===latest.exam_date);
    const clsOnly=sameExam.filter(e=>STUDENTS.find(s=>s.id===e.student_id&&s.cls===student.cls));
    if(clsOnly.length===0) return null;
    const rank=clsOnly.filter(e=>e.score>latest.score).length+1;
    return {rank, total:clsOnly.length, examName:latest.exam_name};
  };
  const mockClsRank   = calcClsRank("mock");
  const schoolClsRank = calcClsRank("school");

  if(loading) return <div style={{textAlign:"center",padding:"2rem",color:"#888780",fontSize:13}}>불러오는 중...</div>;

  return(
    <div>
      {/* 통계 모달 — 학생용 (순위표에서 본인 하이라이트) */}
      {statsModal&&(
        <ExamStatsModalStudent
          keyData={statsModal.keyData}
          allScores={statsModal.allScores}
          myStudentId={statsModal.myStudentId}
          onClose={()=>setStatsModal(null)}
        />
      )}

      {/* 종합 요약 */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:8}}>
        <KpiCard label="출석률" value={attPct+"%"} sub={`${attCount}/${attTotal}회`} valueColor={attPct>=80?"#27500A":"#E24B4A"}/>
        <KpiCard label="최근 단어시험" value={latestScore!==null?latestScore+"점":"—"} sub={`통과 ${passTotal}/${wordTotal}회`}/>
        <KpiCard label="클리닉 신청" value={clinicData.length+"회"} sub={`확정 ${confirmedClinics}회`}/>
        <KpiCard label="OMR 제출" value={omrData.length+"회"} sub="자가 채점"/>
      </div>

      {/* 반 내 등수 — 모의고사/내신 */}
      {(mockClsRank||schoolClsRank)&&(
        <div style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",gap:12,flexWrap:"wrap"}}>
          <div style={{fontSize:12,fontWeight:500,color:"#888780",width:"100%",marginBottom:4}}>📊 반 내 등수</div>
          {mockClsRank&&(
            <div style={{flex:1,textAlign:"center",padding:"8px",background:"#E6F1FB",borderRadius:8}}>
              <div style={{fontSize:11,color:"#888780",marginBottom:2}}>모의고사</div>
              <div style={{fontSize:22,fontWeight:500,color:"#185FA5",lineHeight:1}}>{mockClsRank.rank}<span style={{fontSize:13}}>등</span></div>
              <div style={{fontSize:10,color:"#888780",marginTop:2}}>{student.cls}반 {mockClsRank.total}명 중</div>
              <div style={{fontSize:10,color:"#888780",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:1}}>{mockClsRank.examName}</div>
            </div>
          )}
          {schoolClsRank&&(
            <div style={{flex:1,textAlign:"center",padding:"8px",background:"#EAF3DE",borderRadius:8}}>
              <div style={{fontSize:11,color:"#888780",marginBottom:2}}>내신</div>
              <div style={{fontSize:22,fontWeight:500,color:"#27500A",lineHeight:1}}>{schoolClsRank.rank}<span style={{fontSize:13}}>등</span></div>
              <div style={{fontSize:10,color:"#888780",marginTop:2}}>{student.cls}반 {schoolClsRank.total}명 중</div>
              <div style={{fontSize:10,color:"#888780",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:1}}>{schoolClsRank.examName}</div>
            </div>
          )}
        </div>
      )}

      {/* 성적 추이 3탭 */}
      <Card mb={12}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A"}}>📈 성적 추이</div>
        </div>
        <div style={{display:"flex",gap:4,marginBottom:12}}>
          {[["mock",`모의고사 (${mockScores.length})`],["school",`내신 (${schoolScores.length})`],["homework",`과제물 (${hwScores.length})`]].map(([id,label])=>(
            <button key={id} onClick={()=>setTrendTab(id)}
              style={{fontSize:11,padding:"4px 10px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:trendTab===id?"#185FA5":"#D3D1C7",background:trendTab===id?"#E6F1FB":"transparent",color:trendTab===id?"#185FA5":"#888780",fontWeight:trendTab===id?500:400}}>
              {label}
            </button>
          ))}
        </div>
        {trendData.length===0?(
          <div style={{textAlign:"center",padding:"1rem",color:"#888780",fontSize:13}}>아직 기록이 없어요</div>
        ):(
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
              <KpiCard label="평균" value={trendAvg+"점"} sub={`${trendData.length}회`}/>
              <KpiCard label="최고" value={trendMax+"점"} sub="" valueColor="#27500A"/>
              <KpiCard label="최저" value={trendMin+"점"} sub="" valueColor="#E24B4A"/>
            </div>
            <div style={{background:"#F1EFE8",borderRadius:8,padding:"10px",marginBottom:10}}>
              <ScoreTrendChart data={trendData} height={70}/>
            </div>
            {<div style={{fontSize:10,color:"#888780",marginBottom:6}}>📊 클릭하면 평균·분포를 볼 수 있어요</div>}
            {[...trendData].reverse().map((d,i)=>{
              const col=d.score/(d.max||100)>=0.8?"#639922":d.score/(d.max||100)>=0.65?"#BA7517":"#E24B4A";
              const isClickable=(trendTab==="homework"&&(d.label||d.date))||(!["homework"].includes(trendTab)&&d.date);
              return(
                <div key={d.id||i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,cursor:isClickable?"pointer":"default"}}
                  onClick={()=>{
                    if(trendTab==="homework"&&(d.label||d.date)) openHwStats(d.label,d.date);
                    else if(d.date) openExamStats(d.label,d.date);
                  }}>
                  <span style={{fontSize:11,color:"#888780",width:80,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.label}</span>
                  <div style={{flex:1,background:"#F1EFE8",borderRadius:99,height:7,overflow:"hidden"}}>
                    <div style={{width:(d.score/(d.max||100)*100)+"%",height:"100%",background:col,borderRadius:99}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:500,color:col,width:36,textAlign:"right"}}>{d.score}점</span>
                  {d.grade&&<Badge label={d.grade} type="blue"/>}
                  {isClickable&&<span style={{fontSize:9,color:"#888780"}}>📊</span>}
                </div>
              );
            })}
          </>
        )}
      </Card>

      {/* 단어시험 */}
      <Card mb={12}>
        <SectionTitle>📝 단어시험 점수</SectionTitle>
        {myScores.length===0?(
          <div style={{color:"#888780",fontSize:13}}>아직 점수 기록이 없어요</div>
        ):myScores.map((r,i)=>{
          const col=r.score>=85?"#639922":r.score>=70?"#BA7517":"#E24B4A";
          return(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,cursor:"pointer"}}
              onClick={()=>openScoreStats(r.week)}>
              <span style={{fontSize:11,color:"#888780",width:70,flexShrink:0}}>{r.week}</span>
              <div style={{flex:1,background:"#F1EFE8",borderRadius:99,height:8,overflow:"hidden"}}>
                <div style={{width:r.score+"%",height:"100%",background:col,borderRadius:99}}/>
              </div>
              <span style={{fontSize:12,fontWeight:500,color:col,width:36,textAlign:"right"}}>{r.score}점</span>
              <Badge label={r.pass?"합격":"불합격"} type={r.pass?"green":"red"}/>
              <span style={{fontSize:9,color:"#888780"}}>📊</span>
            </div>
          );
        })}
        {myScores.length>0&&<div style={{fontSize:10,color:"#888780",marginTop:4}}>📊 클릭하면 통계를 볼 수 있어요</div>}
      </Card>

      {/* 출석 */}
      <Card mb={12}>
        <SectionTitle>✅ 출석 현황</SectionTitle>
        {myAtt.length===0?(
          <div style={{color:"#888780",fontSize:13}}>출석 기록이 없어요</div>
        ):(
          <>
            <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:8}}>
              {myAtt.slice(0,30).map((r,i)=>(
                <div key={i} style={{width:26,height:26,borderRadius:6,background:r.status==="O"?"#EAF3DE":r.status==="L"?"#FAEEDA":"#FCEBEB",color:r.status==="O"?"#27500A":r.status==="L"?"#633806":"#791F1F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:500}}>
                  {r.status==="O"?"O":r.status==="L"?"지":"X"}
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:12,fontSize:12,color:"#888780"}}>
              <span>출석 <b style={{color:"#27500A"}}>{attCount}</b>회</span>
              <span>결석 <b style={{color:"#E24B4A"}}>{myAtt.filter(r=>r.status==="X").length}</b>회</span>
              <span>지각 <b style={{color:"#BA7517"}}>{lateCount}</b>회</span>
            </div>
          </>
        )}
      </Card>

      {/* OMR 기록 */}
      <Card mb={12}>
        <SectionTitle>📋 OMR 채점 기록</SectionTitle>
        {omrData.length===0?(
          <div style={{color:"#888780",fontSize:13}}>채점 기록이 없어요</div>
        ):omrData.slice(0,5).map(r=>{
          const p=r.score;const g=p>=90?"A":p>=80?"B":p>=70?"C":p>=60?"D":"F";
          const gType=p>=90?"green":p>=80?"blue":p>=70?"amber":"red";
          return(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:12,flex:1,color:"#2C2C2A"}}>{r.title||r.week}</span>
              <span style={{fontSize:11,color:"#888780"}}>{r.test_date}</span>
              <span style={{fontSize:13,fontWeight:500,color:p>=70?"#27500A":"#E24B4A"}}>{p}점</span>
              <Badge label={g} type={gType}/>
            </div>
          );
        })}
      </Card>

      {/* 클리닉 */}
      <Card mb={12}>
        <SectionTitle>🗓️ 클리닉 신청 내역</SectionTitle>
        {clinicData.length===0?(
          <div style={{color:"#888780",fontSize:13}}>클리닉 신청 내역이 없어요</div>
        ):clinicData.slice(0,5).map(r=>(
          <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:500,color:"#2C2C2A"}}>{r.date} {r.time}</span>
            {r.reason&&r.reason!=="(사유 없음)"&&<span style={{fontSize:11,color:"#888780",flex:1}}>{r.reason}</span>}
            <Badge label={{pending:"대기 중",confirmed:"확정",cancelled:"취소"}[r.status]||r.status} type={{pending:"amber",confirmed:"green",cancelled:"red"}[r.status]||"gray"}/>
          </div>
        ))}
      </Card>

      {/* 강사 코멘트 — 읽기 전용 */}
      <Card mb={0}>
        <SectionTitle>💬 담임 강사 코멘트</SectionTitle>
        {comment?(
          <div style={{fontSize:13,color:"#2C2C2A",lineHeight:1.8,background:"#F1EFE8",borderRadius:8,padding:"12px 14px"}}>{comment}</div>
        ):(
          <div style={{fontSize:13,color:"#888780",textAlign:"center",padding:"1rem"}}>아직 코멘트가 없어요</div>
        )}
        <div style={{fontSize:11,color:"#888780",textAlign:"right",marginTop:6}}>English Academy 담당 강사 드림</div>
      </Card>
    </div>
  );
}

// ── 학생용 통계 모달 (순위표 본인 하이라이트, 타인 익명처리) ──
function ExamStatsModalStudent({keyData,allScores,myStudentId,onClose}){
  if(!allScores||allScores.length===0) return null;
  const scores=allScores.map(d=>d.score).sort((a,b)=>a-b);
  const n=scores.length;
  const avg=Math.round(scores.reduce((a,b)=>a+b,0)/n);
  const variance=scores.reduce((a,b)=>a+(b-avg)**2,0)/n;
  const std=Math.round(Math.sqrt(variance)*10)/10;
  const max=Math.max(...scores);
  const min=Math.min(...scores);
  const passCount=allScores.filter(r=>r.pass||r.score>=70).length;
  const clsAvg={};
  ["A","B","C","D","E","F"].forEach(cls=>{const recs=allScores.filter(r=>r.cls===cls);if(recs.length>0)clsAvg[cls]=Math.round(recs.reduce((a,b)=>a+b.score,0)/recs.length);});
  const bands=[{label:"90~100",min:90,max:100,color:"#639922"},{label:"80~89",min:80,max:89,color:"#7AAD2A"},{label:"70~79",min:70,max:79,color:"#BA7517"},{label:"60~69",min:60,max:69,color:"#D4641A"},{label:"0~59",min:0,max:59,color:"#E24B4A"}];
  const bandCounts=bands.map(b=>({...b,count:scores.filter(s=>s>=b.min&&s<=b.max).length}));
  const maxCount=Math.max(...bandCounts.map(b=>b.count),1);
  // 내 점수
  const myRecord=allScores.find(r=>r.student_id===myStudentId);
  const myRank=myRecord?[...allScores].sort((a,b)=>b.score-a.score).findIndex(r=>r.student_id===myStudentId)+1:null;

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"white",borderRadius:16,padding:"1.5rem",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <div style={{fontSize:15,fontWeight:500,color:"#2C2C2A"}}>{keyData?.title} 통계</div>
            <div style={{fontSize:12,color:"#888780",marginTop:2}}>{keyData?.test_date}</div>
          </div>
          <button onClick={onClose} style={{fontSize:18,background:"transparent",border:"none",cursor:"pointer",color:"#888780"}}>✕</button>
        </div>

        {/* 내 점수 강조 */}
        {myRecord&&(
          <div style={{background:"#E6F1FB",border:"0.5px solid #85B7EB",borderRadius:10,padding:"12px 14px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:12,color:"#0C447C",fontWeight:500}}>내 점수</div>
              <div style={{fontSize:28,fontWeight:500,color:"#185FA5",lineHeight:1}}>{myRecord.score}점</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,color:"#888780"}}>전체 {n}명 중</div>
              <div style={{fontSize:22,fontWeight:500,color:"#185FA5"}}>{myRank}등</div>
              <div style={{fontSize:11,color:"#888780"}}>평균 대비 {myRecord.score-avg>0?"▲":"▼"}{Math.abs(myRecord.score-avg)}점</div>
            </div>
          </div>
        )}

        {/* 전체 KPI */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
          <KpiCard label="전체 평균" value={avg+"점"} sub={`${n}명`}/>
          <KpiCard label="표준편차" value={std} sub={`최고 ${max}점`}/>
          <KpiCard label="최고점" value={max+"점"} sub="" valueColor="#27500A"/>
          <KpiCard label="최저점" value={min+"점"} sub="" valueColor="#E24B4A"/>
        </div>

        {/* 반별 평균 */}
        {Object.keys(clsAvg).length>0&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:500,color:"#888780",marginBottom:6}}>반별 평균</div>
            <div style={{display:"flex",gap:8}}>
              {Object.entries(clsAvg).map(([cls,a])=>(
                <div key={cls} style={{flex:1,background:"#F1EFE8",borderRadius:8,padding:"8px",textAlign:"center"}}>
                  <div style={{fontSize:11,color:"#888780"}}>{cls}반</div>
                  <div style={{fontSize:18,fontWeight:500,color:"#185FA5"}}>{a}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 점수 분포 */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:500,color:"#888780",marginBottom:8}}>점수 분포</div>
          <div style={{display:"flex",gap:6,alignItems:"flex-end",height:80,padding:"0 4px"}}>
            {bandCounts.map(b=>(
              <div key={b.label} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{fontSize:10,color:b.color,fontWeight:500}}>{b.count}명</div>
                <div style={{width:"100%",background:b.color,borderRadius:"4px 4px 0 0",height:Math.max(b.count/maxCount*60,b.count>0?6:0)+"px"}}/>
                <div style={{fontSize:8,color:"#888780",textAlign:"center"}}>{b.label}</div>
              </div>
            ))}
          </div>
          {/* 정규분포 곡선 */}
          <svg width="100%" height="50" viewBox="0 0 400 50" style={{marginTop:8,overflow:"visible"}}>
            <defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#E24B4A" stopOpacity="0.3"/><stop offset="60%" stopColor="#7AAD2A" stopOpacity="0.3"/><stop offset="100%" stopColor="#639922" stopOpacity="0.3"/></linearGradient></defs>
            {(()=>{
              const pts=[];for(let i=0;i<=100;i+=2){const z=(i-avg)/Math.max(std,1);const y=Math.exp(-0.5*z*z);pts.push([i/100*400,45-y*40]);}
              const path="M "+pts.map(p=>p.join(",")).join(" L ");
              const area="M 0,45 L "+pts.map(p=>p.join(",")).join(" L ")+" L 400,45 Z";
              // 내 점수 표시
              const myX=myRecord?myRecord.score/100*400:null;
              return(<>
                <path d={area} fill="url(#sg)"/>
                <path d={path} stroke="#185FA5" strokeWidth="1.5" fill="none"/>
                <line x1={avg/100*400} y1="0" x2={avg/100*400} y2="45" stroke="#888780" strokeWidth="1" strokeDasharray="3,2"/>
                <text x={avg/100*400+3} y="10" fontSize="8" fill="#888780">평균 {avg}</text>
                {myX&&<>
                  <line x1={myX} y1="0" x2={myX} y2="45" stroke="#185FA5" strokeWidth="1.5"/>
                  <text x={myX+3} y="20" fontSize="8" fill="#185FA5" fontWeight="bold">나</text>
                </>}
              </>);
            })()}
          </svg>
        </div>

        <div style={{fontSize:11,color:"#888780",textAlign:"center",padding:"6px",background:"#F1EFE8",borderRadius:6}}>
          🔒 다른 학생의 이름·점수는 비공개예요
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
function StudentExamScores({student}){
  const [examData,setExamData] = useState([]);
  const [loading,setLoading]   = useState(true);
  const [tab,setTab]           = useState("mock");

  useEffect(()=>{
    supabase.from("exam_scores").select("*").order("exam_date",{ascending:true})
      .then(({data})=>{ setExamData(data||[]); setLoading(false); });
  },[student.id]);

  if(loading) return null;

  const myMock   = examData.filter(r=>r.student_id===student.id&&r.exam_type==="mock");
  const mySchool = examData.filter(r=>r.student_id===student.id&&r.exam_type==="school");

  const getAvg=(examName,examDate)=>{
    const recs=examData.filter(r=>r.exam_name===examName&&r.exam_date===examDate);
    return recs.length>0?Math.round(recs.reduce((a,b)=>a+b.score,0)/recs.length):null;
  };

  const myData = tab==="mock"?myMock:mySchool;
  const typeLabel = tab==="mock"?"모의고사":"내신";

  if(myMock.length===0&&mySchool.length===0) return null;

  return(
    <Card mb={12}>
      <div style={{display:"flex",gap:4,marginBottom:12}}>
        {[["mock",`모의고사 (${myMock.length})`],["school",`내신 (${mySchool.length})`]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{fontSize:12,padding:"5px 12px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:tab===id?"#185FA5":"#D3D1C7",background:tab===id?"#E6F1FB":"transparent",color:tab===id?"#185FA5":"#888780",fontWeight:tab===id?500:400}}>
            {label}
          </button>
        ))}
      </div>
      {myData.length===0?(
        <div style={{textAlign:"center",padding:"1rem",color:"#888780",fontSize:13}}>아직 {typeLabel} 기록이 없어요</div>
      ):myData.map((r,i)=>{
        const allAvg=getAvg(r.exam_name,r.exam_date);
        const col=r.score/(r.max_score||100)>=0.8?"#639922":r.score/(r.max_score||100)>=0.65?"#BA7517":"#E24B4A";
        const diff=allAvg!==null?r.score-allAvg:null;
        return(
          <div key={r.id} style={{padding:"10px 0",borderBottom:i<myData.length-1?"0.5px solid #F1EFE8":"none"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6,flexWrap:"wrap",gap:4}}>
              <div>
                <span style={{fontSize:13,fontWeight:500,color:"#2C2C2A"}}>{r.exam_name}</span>
                <span style={{fontSize:11,color:"#888780",marginLeft:8}}>{r.exam_date} · {r.subject}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {r.grade&&<Badge label={r.grade} type="blue"/>}
                <span style={{fontSize:15,fontWeight:500,color:col}}>{r.score}점</span>
                {diff!==null&&(
                  <span style={{fontSize:11,color:diff>0?"#27500A":diff<0?"#E24B4A":"#888780"}}>
                    {diff>0?`▲${diff}`:diff<0?`▼${Math.abs(diff)}`:"="} (전체 평균 대비)
                  </span>
                )}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{flex:1,background:"#F1EFE8",borderRadius:99,height:6,overflow:"hidden"}}>
                <div style={{width:(r.score/(r.max_score||100)*100)+"%",height:"100%",background:col,borderRadius:99}}/>
              </div>
              {allAvg!==null&&<span style={{fontSize:10,color:"#888780",flexShrink:0}}>전체 평균 {allAvg}점</span>}
            </div>
          </div>
        );
      })}
      <div style={{fontSize:11,color:"#888780",marginTop:8,padding:"6px",background:"#F1EFE8",borderRadius:6,textAlign:"center"}}>
        🔒 다른 학생의 점수나 등수는 비공개예요
      </div>
    </Card>
  );
}

function StudentApp({student,onLogout,files,banner,hallOfFame,clinicRequests,setClinicRequests,attendanceData,scoresData}){
  const [activeTab,setActiveTab]=useState("home");
  const [showClinic,setShowClinic]=useState(false);
  const [clinicForm,setClinicForm]=useState({date:"",time:"",reason:""});
  const [clinicDone,setClinicDone]=useState(false);
  const [questions,setQuestions]=useState([]);
  const [omrAutoKeyId,setOmrAutoKeyId]=useState(null);
  const [showReviewPage,setShowReviewPage]=useState(false); // 리뷰 전체 화면

  // 과제물 탭에서 채점하기 버튼 눌렀을 때
  const handleGoToOMR=(keyId)=>{
    setOmrAutoKeyId(keyId);
    setActiveTab("omr");
  };

  // 미답변 질문 실시간 로드
  useEffect(()=>{
    supabase.from("questions").select("id,answer").eq("student_id",student.id)
      .then(({data})=>setQuestions(data||[]));
    const ch=supabase.channel("my_questions")
      .on("postgres_changes",{event:"*",schema:"public",table:"questions"},()=>{
        supabase.from("questions").select("id,answer").eq("student_id",student.id)
          .then(({data})=>setQuestions(data||[]));
      }).subscribe();
    return ()=>supabase.removeChannel(ch);
  },[student.id]);

  // DB 출석 데이터 → 이번 달 출석 배열로 변환
  const myAttArr = (attendanceData[student.id]||[]);
  const attArr = myAttArr.length > 0
    ? myAttArr.map(r => r.status==="O" ? 1 : 0)
    : MONTH_ATT[student.id]||[];
  const attendCount = myAttArr.length > 0
    ? myAttArr.filter(r=>r.status==="O").length
    : attArr.filter(v=>v===1).length;
  const attendPct = attArr.length > 0 ? Math.round(attendCount/attArr.length*100) : 0;

  // DB 점수 데이터 → 점수 배열로 변환
  const myScores = (scoresData[student.id]||[]);
  const scoreHistory = myScores.length > 0
    ? myScores.slice(0,7).reverse().map(r=>({wk:r.week, s:r.score}))
    : SCORE_HISTORY;
  const latest = scoreHistory.length > 0 ? scoreHistory[scoreHistory.length-1].s : 0;
  const diff   = scoreHistory.length > 1 ? latest - scoreHistory[scoreHistory.length-2].s : 0;
  const passCount = myScores.length > 0 ? myScores.filter(r=>r.pass).length : 0;

  // 반 내 등수 — 같은 반 학생들의 최근 점수 기준 계산
  const myLatestScore = myScores.length>0 ? myScores[0].score : null;
  const clsStudents   = STUDENTS.filter(s=>s.cls===student.cls);

  // 단어시험 반 내 등수
  const clsScores     = clsStudents.map(s=>{
    const recs=scoresData[s.id]||[];
    return recs.length>0?recs[0].score:null;
  }).filter(v=>v!==null);
  const myRankInCls   = myLatestScore!==null
    ? clsScores.filter(v=>v>myLatestScore).length+1
    : null;

  // 모의고사 반 내 등수 — exam_scores에서 가장 최근 모의고사 기준
  // (StudentApp이 렌더될 때 별도 로드 없이 scoresData 기반으로는 못 가져오므로
  //  StudentReportView에서 계산한 값을 props로 받는 대신
  //  KpiCard는 "성적 탭에서 확인" 안내로 대체하고 성적 탭에 표시)
  // → 홈 KPI는 단어시험 등수 유지, 성적 탭에서 모의고사/내신 등수 표시

  const progColor = v => v>=85?"#639922":v>=70?"#BA7517":"#E24B4A";
  const progress  = PROGRESS_LABELS.map((l,i)=>[l,[90,85,92,88,80,83][i]]);
  const myNewFiles = files.filter(f=>(f.cls==="전체"||f.cls===student.cls)&&f.isNew);
  const tabs=[{id:"home",label:"홈",icon:"🏠"},{id:"scores",label:"성적",icon:"📊"},{id:"homework",label:"과제물",icon:"📁"},{id:"qna",label:"Q&A",icon:"💬"},{id:"ai",label:"AI",icon:"🤖"},{id:"vocab",label:"단어퀴즈",icon:"🔤"},{id:"points",label:"포인트",icon:"🪙"}];

  // 리뷰 전체 화면으로 전환
  if(showReviewPage) return <StudentReviewPage student={student} onBack={()=>setShowReviewPage(false)}/>;

  return(
    <div style={{minHeight:"100vh",background:"#F1EFE8",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",paddingBottom:70}}>
      <header style={{background:"#185FA5",padding:"0 16px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Avatar name={student.name} idx={student.id} size={30}/>
          <div><div style={{color:"#E6F1FB",fontWeight:500,fontSize:14,display:"flex",alignItems:"center",gap:6}}>{student.name} <XpBadge xp={student.xp||0}/></div><div style={{color:"#85B7EB",fontSize:11}}>{student.cls}반 · {student.course}</div></div>
        </div>
        <button onClick={onLogout} style={{fontSize:12,color:"#85B7EB",background:"transparent",border:"none",cursor:"pointer"}}>로그아웃</button>
      </header>
      {banner&&(
        <div style={{background:"#0F6E56",padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:13,color:"#9FE1CB",fontWeight:500,flex:1,lineHeight:1.5}}>{banner}</span>
        </div>
      )}
      <main style={{maxWidth:640,margin:"0 auto",padding:"16px"}}>
        {activeTab==="home"&&(
          <div style={{paddingBottom:8}}>

            {/* ── 클리닉 배너 ── */}
            <div onClick={()=>{setShowClinic(true);setClinicDone(false);}}
              style={{background:"linear-gradient(135deg,#1a1a2e,#16213e)",borderRadius:16,padding:"16px 20px",marginBottom:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",border:"0.5px solid rgba(255,255,255,0.1)"}}>
              <div>
                <div style={{fontSize:11,color:"#85B7EB",marginBottom:4,fontWeight:500,letterSpacing:"0.05em"}}>1등급 조교진에게</div>
                <div style={{fontSize:16,fontWeight:600,color:"white",marginBottom:2}}>개별 클리닉 신청</div>
                <div style={{fontSize:12,color:"#AFA9EC"}}>1:1 맞춤 수업을 신청하세요</div>
              </div>
              <div style={{width:48,height:48,borderRadius:12,background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>📅</div>
            </div>

            {/* ── AI Q&A 배너 ── */}
            <div onClick={()=>setActiveTab("qna")}
              style={{background:"white",borderRadius:16,padding:"14px 18px",marginBottom:12,cursor:"pointer",display:"flex",alignItems:"center",gap:14,border:"0.5px solid #E8E6E0",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
              <div style={{width:44,height:44,borderRadius:12,background:"#F1EFE8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>💬</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:"#2C2C2A"}}>AI 강사에게 질문하기</div>
                <div style={{fontSize:12,color:"#888780",marginTop:2}}>문법·어휘·독해 질문 & Q&A</div>
              </div>
              <span style={{fontSize:18,color:"#D3D1C7"}}>›</span>
            </div>

            {/* ── 수업 후기 ── */}
            <div style={{background:"white",borderRadius:16,padding:"16px 18px",marginBottom:12,border:"0.5px solid #E8E6E0",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div style={{fontSize:15,fontWeight:600,color:"#2C2C2A"}}>수업 후기</div>
                <button onClick={()=>setShowReviewPage(true)}
                  style={{fontSize:12,color:"#185FA5",background:"transparent",border:"none",cursor:"pointer",fontWeight:500}}>후기 작성 &gt;</button>
              </div>
              <div style={{background:"linear-gradient(135deg,#E6F1FB,#EAF3DE)",borderRadius:12,padding:"14px 16px",textAlign:"center",marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:600,color:"#2C2C2A",marginBottom:2}}>🎁 후기 작성 시 <span style={{color:"#185FA5"}}>200P</span> 지급! 베스트 선정 시 <span style={{color:"#27500A"}}>500P</span> 추가!</div>
              </div>
              <button onClick={()=>setShowReviewPage(true)}
                style={{width:"100%",fontSize:14,fontWeight:600,padding:"13px",borderRadius:12,border:"none",background:"#1a1a2e",color:"white",cursor:"pointer",letterSpacing:"0.02em"}}>
                후기 작성하기
              </button>
            </div>

            {/* ── 명예의 전당 (자동 슬라이드) ── */}
            {hallOfFame&&hallOfFame.length>0&&(
              <HallOfFameSlider hallOfFame={hallOfFame}/>
            )}

            {/* ── 내 정보 ── */}
            <div style={{background:"white",borderRadius:16,padding:"16px 18px",marginBottom:12,border:"0.5px solid #E8E6E0",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{fontSize:15,fontWeight:600,color:"#2C2C2A"}}>내 정보</div>
                <span style={{fontSize:12,color:"#888780"}}>수정</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[
                  {label:"학교",value:student.school||"—"},
                  {label:"연락처",value:student.phone||"—"},
                  {label:"학부모",value:student.parent_phone||"—"},
                  {label:"시간표",value:student.timetable||"—"},
                ].map((item,i)=>(
                  <div key={i} style={{background:"#F8F7F4",borderRadius:10,padding:"10px 12px"}}>
                    <div style={{fontSize:11,color:"#888780",marginBottom:3}}>{item.label}</div>
                    <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A",wordBreak:"break-all"}}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 최근 Q&A 현황 ── */}
            <div style={{background:"white",borderRadius:16,padding:"16px 18px",marginBottom:12,border:"0.5px solid #E8E6E0",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{fontSize:15,fontWeight:600,color:"#2C2C2A"}}>최근 Q&A 현황</div>
                <button onClick={()=>setActiveTab("qna")} style={{fontSize:12,color:"#185FA5",background:"transparent",border:"none",cursor:"pointer",fontWeight:500}}>전체 보기 &gt;</button>
              </div>
              <RecentQnaBanner student={student}/>
            </div>

            {/* ── 새 과제물 ── */}
            {myNewFiles.length>0&&(
              <div style={{background:"white",borderRadius:16,padding:"16px 18px",marginBottom:12,border:"0.5px solid #E8E6E0",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{fontSize:15,fontWeight:600,color:"#2C2C2A"}}>새 과제물 🆕</div>
                  <button onClick={()=>setActiveTab("homework")} style={{fontSize:12,color:"#185FA5",background:"transparent",border:"none",cursor:"pointer",fontWeight:500}}>전체 보기 &gt;</button>
                </div>
                {myNewFiles.slice(0,3).map(f=>(
                  <div key={f.id} onClick={()=>setActiveTab("homework")}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"0.5px solid #F1EFE8",cursor:"pointer"}}
                    onMouseEnter={e=>e.currentTarget.style.opacity="0.7"}
                    onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                    <div style={{width:36,height:36,borderRadius:8,background:"#FCEBEB",color:"#791F1F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:600,flexShrink:0}}>PDF</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:500,color:"#2C2C2A"}}>{f.title}</div>
                      <div style={{fontSize:11,color:"#888780"}}>{f.date}</div>
                    </div>
                    <span style={{fontSize:16,color:"#D3D1C7"}}>›</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 클리닉 신청 모달 (전역) ── */}
        {showClinic&&(
          <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}}>
            <div style={{background:"white",width:"100%",maxWidth:480,borderRadius:"20px 20px 0 0",padding:"1.5rem",maxHeight:"80vh",overflowY:"auto"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <div style={{fontSize:16,fontWeight:600,color:"#2C2C2A"}}>개별 클리닉 신청</div>
                <button onClick={()=>setShowClinic(false)} style={{fontSize:20,background:"transparent",border:"none",cursor:"pointer",color:"#888780"}}>✕</button>
              </div>
              {!clinicDone?(
                <>
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:12,color:"#888780",marginBottom:6}}>희망 날짜</div>
                    <input type="date" value={clinicForm.date} onChange={e=>setClinicForm({...clinicForm,date:e.target.value})}
                      style={{width:"100%",fontSize:13,padding:"10px 12px",borderRadius:10,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
                  </div>
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:12,color:"#888780",marginBottom:8}}>희망 시간</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {["14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"].map(t=>(
                        <button key={t} onClick={()=>setClinicForm({...clinicForm,time:t})}
                          style={{padding:"8px 14px",borderRadius:10,border:`0.5px solid ${clinicForm.time===t?"#0F6E56":"#D3D1C7"}`,background:clinicForm.time===t?"#EAF3DE":"transparent",color:clinicForm.time===t?"#085041":"#888780",fontSize:13,fontWeight:clinicForm.time===t?600:400,cursor:"pointer"}}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{marginBottom:20}}>
                    <div style={{fontSize:12,color:"#888780",marginBottom:6}}>신청 사유 (선택)</div>
                    <textarea value={clinicForm.reason} onChange={e=>setClinicForm({...clinicForm,reason:e.target.value})}
                      placeholder="예: 문법 파트 질문이 있어요" rows={3}
                      style={{width:"100%",fontSize:13,padding:"10px 12px",borderRadius:10,border:"0.5px solid #D3D1C7",resize:"none",boxSizing:"border-box"}}/>
                  </div>
                  <button onClick={async()=>{
                    if(!clinicForm.date){alert("날짜를 선택해주세요.");return;}
                    if(!clinicForm.time){alert("시간을 선택해주세요.");return;}
                    await supabase.from("clinic_requests").insert({
                      student_id:student.id,student_name:student.name,cls:student.cls,
                      date:clinicForm.date,time:clinicForm.time,
                      reason:clinicForm.reason||"(사유 없음)",status:"pending",
                    });
                    setClinicDone(true);
                  }} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:"#0F6E56",color:"white",fontSize:15,fontWeight:600,cursor:"pointer"}}>
                    신청하기
                  </button>
                </>
              ):(
                <div style={{textAlign:"center",padding:"2rem 0"}}>
                  <div style={{fontSize:48,marginBottom:12}}>✅</div>
                  <div style={{fontSize:17,fontWeight:600,color:"#2C2C2A",marginBottom:8}}>신청 완료!</div>
                  <div style={{fontSize:13,color:"#888780",lineHeight:1.7,marginBottom:20}}>
                    <b>{clinicForm.date}</b> {clinicForm.time} 으로 신청됐어요.<br/>선생님 확인 후 안내드릴게요.
                  </div>
                  <button onClick={()=>setShowClinic(false)}
                    style={{padding:"12px 32px",borderRadius:12,border:"none",background:"#F1EFE8",color:"#2C2C2A",fontSize:14,fontWeight:600,cursor:"pointer"}}>닫기</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab==="scores"&&(
          <StudentReportView
            student={student}
            attendanceData={attendanceData}
            scoresData={scoresData}
          />
        )}
                {activeTab==="attend"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              <KpiCard label="출석일" value={attendCount+"일"} sub={`전체 ${attArr.length}회`} valueColor="#27500A"/>
              <KpiCard label="출석률" value={attendPct+"%"} sub={attendPct>=80?"우수":"보통"} valueColor={attendPct>=80?"#27500A":"#BA7517"}/>
            </div>
            <Card mb={0}>
              <SectionTitle>이번 달 출석 현황</SectionTitle>
              {attArr.length===0?(
                <div style={{textAlign:"center",padding:"1rem",color:"#888780",fontSize:13}}>아직 출석 기록이 없어요</div>
              ):(
                <>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
                    {myAttArr.length>0
                      ?myAttArr.map((r,i)=>(<div key={i} style={{width:32,height:32,borderRadius:8,background:r.status==="O"?"#EAF3DE":r.status==="L"?"#FAEEDA":"#FCEBEB",color:r.status==="O"?"#27500A":r.status==="L"?"#633806":"#791F1F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:500}}>{r.status==="O"?"O":r.status==="L"?"지":"X"}</div>))
                      :attArr.map((v,i)=>(<div key={i} style={{width:32,height:32,borderRadius:8,background:v?"#EAF3DE":"#FCEBEB",color:v?"#27500A":"#791F1F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:500}}>{i+1}</div>))
                    }
                  </div>
                  <div style={{display:"flex",gap:16,fontSize:12,color:"#888780"}}><span><span style={{color:"#27500A",fontWeight:500}}>■</span> 출석 {attendCount}회</span><span><span style={{color:"#E24B4A",fontWeight:500}}>■</span> 결석 {attArr.length-attendCount}회</span></div>
                </>
              )}
            </Card>
          </div>
        )}
        {activeTab==="homework"&&<HomeworkStudent student={student} files={files}/>}
        {activeTab==="omr"&&<StudentOMR student={student} autoKeyId={omrAutoKeyId} onAutoKeyUsed={()=>setOmrAutoKeyId(null)}/>}
        {activeTab==="clinic"&&<StudentClinicHistory student={student}/>}
        {activeTab==="qna"&&<StudentQnA student={student}/>}
        {activeTab==="ai"&&<StudentAIChat student={student}/>}
        {activeTab==="vocab"&&<StudentVocabQuiz student={student}/>}
        {activeTab==="points"&&<StudentPointsView student={student}/>}
      </main>
      <nav style={{position:"fixed",bottom:0,left:0,right:0,background:"white",borderTop:"0.5px solid #D3D1C7",display:"flex",height:60,zIndex:100}}>
        {tabs.map(tab=>{
          const hasNotif=tab.id==="qna"&&questions.filter(q=>!q.answer).length>0;
          return(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
              style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,background:"transparent",border:"none",cursor:"pointer",color:activeTab===tab.id?"#185FA5":"#888780",position:"relative"}}>
              <span style={{fontSize:18}}>{tab.icon}</span>
              {hasNotif&&<span style={{position:"absolute",top:4,right:"calc(50% - 16px)",width:8,height:8,borderRadius:"50%",background:"#E24B4A"}}/>}
              <span style={{fontSize:10,fontWeight:activeTab===tab.id?500:400}}>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ════════════════════════════════════════════════
// 클리닉 신청 관리 (강사 전용 — Supabase 연동)
// ════════════════════════════════════════════════
function ClinicManage(){
  const [requests,setRequests]=useState([]);
  const [filter,setFilter]=useState("all");
  const [loading,setLoading]=useState(true);

  const fetchRequests=async()=>{
    setLoading(true);
    const {data,error}=await supabase
      .from("clinic_requests")
      .select("*")
      .order("created_at",{ascending:false});
    if(!error) setRequests(data||[]);
    setLoading(false);
  };

  useEffect(()=>{
    fetchRequests();
    // 실시간 업데이트 구독
    const channel=supabase.channel("clinic_changes")
      .on("postgres_changes",{event:"*",schema:"public",table:"clinic_requests"},()=>{
        fetchRequests();
      })
      .subscribe();
    return ()=>supabase.removeChannel(channel);
  },[]);

  const updateStatus=async(id,status)=>{
    const {error}=await supabase.from("clinic_requests").update({status}).eq("id",id);
    if(!error) setRequests(prev=>prev.map(r=>r.id===id?{...r,status}:r));
  };

  const deleteReq=async(id)=>{
    if(!window.confirm("이 신청을 삭제할까요?"))return;
    const {error}=await supabase.from("clinic_requests").delete().eq("id",id);
    if(!error) setRequests(prev=>prev.filter(r=>r.id!==id));
  };

  const filtered=requests.filter(r=>filter==="all"||r.status===filter);
  const pendingCount=requests.filter(r=>r.status==="pending").length;
  const confirmedCount=requests.filter(r=>r.status==="confirmed").length;
  const statusLabel={pending:"대기 중",confirmed:"확정",cancelled:"취소"};
  const statusType={pending:"amber",confirmed:"green",cancelled:"red"};

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div/>
        <button onClick={fetchRequests} style={{fontSize:12,padding:"5px 12px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>↻ 새로고침</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
        <KpiCard label="신청 대기" value={pendingCount+"건"} sub="확인 필요" valueColor={pendingCount>0?"#E24B4A":"#888780"}/>
        <KpiCard label="확정" value={confirmedCount+"건"} sub="일정 확정됨" valueColor="#27500A"/>
        <KpiCard label="전체 신청" value={requests.length+"건"} sub="누적"/>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {[["all","전체"],["pending","대기 중"],["confirmed","확정"],["cancelled","취소"]].map(([v,label])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{fontSize:12,padding:"5px 14px",borderRadius:99,cursor:"pointer",border:"0.5px solid",borderColor:filter===v?"#888780":"#D3D1C7",background:filter===v?"#F1EFE8":"transparent",color:filter===v?"#2C2C2A":"#888780",fontWeight:filter===v?500:400}}>
            {label}
          </button>
        ))}
      </div>

      {loading?(
        <div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13}}>불러오는 중...</div>
      ):filtered.length===0?(
        <div style={{textAlign:"center",padding:"4rem",color:"#888780",fontSize:13}}>
          {filter==="all"?"아직 클리닉 신청이 없어요":"해당 상태의 신청이 없어요"}
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map(r=>(
            <div key={r.id} style={{background:"white",border:`0.5px solid ${r.status==="pending"?"#EF9F27":"#D3D1C7"}`,borderRadius:12,padding:"1rem 1.25rem"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"#E6F1FB",color:"#0C447C",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:500,flexShrink:0}}>
                    {r.student_name?.slice(0,2)}
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,color:"#2C2C2A"}}>{r.student_name}</div>
                    <div style={{fontSize:11,color:"#888780",marginTop:2}}>{r.cls}반 · {new Date(r.created_at).toLocaleDateString("ko-KR")} 신청</div>
                  </div>
                </div>
                <Badge label={statusLabel[r.status]||r.status} type={statusType[r.status]||"gray"}/>
              </div>

              <div style={{background:"#F1EFE8",borderRadius:8,padding:"10px 12px",marginBottom:12}}>
                <div style={{display:"flex",gap:16,marginBottom:6,flexWrap:"wrap"}}>
                  <div><span style={{fontSize:11,color:"#888780"}}>희망 날짜 </span><span style={{fontSize:13,fontWeight:500,color:"#2C2C2A"}}>{r.date}</span></div>
                  <div><span style={{fontSize:11,color:"#888780"}}>희망 시간 </span><span style={{fontSize:13,fontWeight:500,color:"#2C2C2A"}}>{r.time}</span></div>
                </div>
                {r.reason&&r.reason!=="(사유 없음)"&&(
                  <div style={{fontSize:12,color:"#5F5E5A",lineHeight:1.6}}><span style={{color:"#888780"}}>내용: </span>{r.reason}</div>
                )}
              </div>

              <div style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
                {r.status==="pending"&&(<>
                  <button onClick={()=>updateStatus(r.id,"confirmed")} style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"none",background:"#EAF3DE",color:"#27500A",fontWeight:500,cursor:"pointer"}}>✓ 확정</button>
                  <button onClick={()=>updateStatus(r.id,"cancelled")} style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"none",background:"#FCEBEB",color:"#791F1F",fontWeight:500,cursor:"pointer"}}>✕ 취소</button>
                </>)}
                {r.status==="confirmed"&&(
                  <button onClick={()=>updateStatus(r.id,"pending")} style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>대기로 변경</button>
                )}
                {r.status==="cancelled"&&(
                  <button onClick={()=>updateStatus(r.id,"pending")} style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>다시 대기로</button>
                )}
                <button onClick={()=>deleteReq(r.id)} style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"0.5px solid #D3D1C7",background:"transparent",color:"#888780",cursor:"pointer"}}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// 명예의 전당 관리 (강사 전용)
// ════════════════════════════════════════════════
function HallOfFameManage({hallOfFame,setHallOfFame}){
  const [form,setForm]=useState({name:"",achievement:"",student_type:"재학생"});
  const [successMsg,setSuccessMsg]=useState("");
  const [filterType,setFilterType]=useState("재학생");

  const add=async()=>{
    if(!form.name.trim()){alert("이름을 입력해주세요.");return;}
    if(!form.achievement.trim()){alert("성과를 입력해주세요.");return;}
    const typeFiltered=hallOfFame.filter(h=>h.student_type===form.student_type);
    const {data,error}=await supabase.from("hall_of_fame").insert({
      name:form.name, achievement:form.achievement,
      order_num:typeFiltered.length, student_type:form.student_type,
    }).select().single();
    if(error){alert("저장 중 오류가 발생했습니다.");return;}
    setHallOfFame(prev=>[...prev,data]);
    setForm({name:"",achievement:"",student_type:form.student_type});
    setSuccessMsg(`"${form.name}" 학생이 명예의 전당(${form.student_type})에 추가됐어요!`);
    setTimeout(()=>setSuccessMsg(""),3000);
  };

  const remove=async(id)=>{
    const h=hallOfFame.find(x=>x.id===id);
    if(!window.confirm(`"${h.name}"을 명예의 전당에서 삭제할까요?`))return;
    const {error}=await supabase.from("hall_of_fame").delete().eq("id",id);
    if(error){alert("삭제 중 오류가 발생했습니다.");return;}
    setHallOfFame(prev=>prev.filter(x=>x.id!==id));
  };

  const moveUp=async(list,i)=>{
    if(i===0)return;
    const arr=[...hallOfFame];
    const gi=arr.indexOf(list[i]);
    const gj=arr.indexOf(list[i-1]);
    [arr[gi],arr[gj]]=[arr[gj],arr[gi]];
    setHallOfFame(arr);
    await supabase.from("hall_of_fame").update({order_num:i-1}).eq("id",list[i].id);
    await supabase.from("hall_of_fame").update({order_num:i}).eq("id",list[i-1].id);
  };

  const moveDown=async(list,i)=>{
    if(i===list.length-1)return;
    const arr=[...hallOfFame];
    const gi=arr.indexOf(list[i]);
    const gj=arr.indexOf(list[i+1]);
    [arr[gi],arr[gj]]=[arr[gj],arr[gi]];
    setHallOfFame(arr);
    await supabase.from("hall_of_fame").update({order_num:i+1}).eq("id",list[i].id);
    await supabase.from("hall_of_fame").update({order_num:i}).eq("id",list[i+1].id);
  };

  const medals=["🥇","🥈","🥉"];
  const currentList=hallOfFame.filter(h=>(h.student_type||"재학생")===filterType);

  return(
    <div>
      <SuccessBox msg={successMsg}/>

      {/* 탭 */}
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {["재학생","졸업생"].map(t=>(
          <button key={t} onClick={()=>setFilterType(t)}
            style={{fontSize:13,padding:"7px 20px",borderRadius:99,cursor:"pointer",border:`0.5px solid ${filterType===t?"#3C3489":"#D3D1C7"}`,background:filterType===t?"#EEEDFE":"transparent",color:filterType===t?"#3C3489":"#888780",fontWeight:filterType===t?500:400}}>
            {t==="재학생"?"🎒 재학생":"🎓 졸업생"} ({hallOfFame.filter(h=>(h.student_type||"재학생")===t).length})
          </button>
        ))}
      </div>

      {/* 목록 */}
      {currentList.length>0&&(
        <div style={{background:"white",border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden",marginBottom:16}}>
          <div style={{background:"#3C3489",padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>{filterType==="재학생"?"🎒":"🎓"}</span>
            <div style={{fontSize:14,fontWeight:500,color:"white"}}>{filterType} 명예의 전당</div>
          </div>
          <div>
            {currentList.map((h,i)=>(
              <div key={h.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<currentList.length-1?"0.5px solid #F1EFE8":"none"}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:i===0?"#FAEEDA":i===1?"#F1EFE8":"#EEEDFE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                  {medals[i]||"⭐"}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:500,color:"#2C2C2A"}}>{h.name}</div>
                  <div style={{fontSize:12,color:"#888780",marginTop:2}}>{h.achievement}</div>
                </div>
                <div style={{display:"flex",gap:4,flexShrink:0}}>
                  <button onClick={()=>moveUp(currentList,i)} disabled={i===0} style={{fontSize:11,padding:"3px 8px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",cursor:i===0?"default":"pointer",color:i===0?"#D3D1C7":"#888780"}}>▲</button>
                  <button onClick={()=>moveDown(currentList,i)} disabled={i===currentList.length-1} style={{fontSize:11,padding:"3px 8px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",cursor:i===currentList.length-1?"default":"pointer",color:i===currentList.length-1?"#D3D1C7":"#888780"}}>▼</button>
                  <button onClick={()=>remove(h.id)} style={{fontSize:11,padding:"3px 8px",borderRadius:6,border:"0.5px solid #F09595",background:"#FCEBEB",cursor:"pointer",color:"#791F1F"}}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {currentList.length===0&&(
        <div style={{textAlign:"center",padding:"2rem",color:"#888780",fontSize:13,background:"white",borderRadius:12,border:"0.5px solid #D3D1C7",marginBottom:16}}>
          아직 {filterType} 명예의 전당에 등록된 학생이 없어요
        </div>
      )}

      {/* 추가 폼 */}
      <Card>
        <SectionTitle>학생 추가</SectionTitle>
        {/* 재학생/졸업생 선택 */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,color:"#888780",marginBottom:6}}>구분</div>
          <div style={{display:"flex",gap:8}}>
            {["재학생","졸업생"].map(t=>(
              <button key={t} onClick={()=>setForm({...form,student_type:t})}
                style={{flex:1,padding:"8px",borderRadius:8,cursor:"pointer",border:`0.5px solid ${form.student_type===t?"#3C3489":"#D3D1C7"}`,background:form.student_type===t?"#EEEDFE":"transparent",color:form.student_type===t?"#3C3489":"#888780",fontWeight:form.student_type===t?500:400,fontSize:13}}>
                {t==="재학생"?"🎒 재학생":"🎓 졸업생"}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div>
            <div style={{fontSize:12,color:"#888780",marginBottom:6}}>학생 이름 *</div>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
              placeholder="예: 김민준"
              style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>
              {STUDENTS.slice(0,6).map(s=>(
                <button key={s.id} onClick={()=>setForm({...form,name:s.name})}
                  style={{fontSize:11,padding:"2px 8px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",cursor:"pointer",color:"#888780"}}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:12,color:"#888780",marginBottom:6}}>성과/업적 *</div>
            <input value={form.achievement} onChange={e=>setForm({...form,achievement:e.target.value})}
              placeholder="예: 수능 1등급"
              style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>
              {["수능 1등급","내신 1등급","1학년 전체 1등급","성적 향상","개근","우수"].map(a=>(
                <button key={a} onClick={()=>setForm({...form,achievement:a})}
                  style={{fontSize:11,padding:"2px 8px",borderRadius:6,border:"0.5px solid #D3D1C7",background:"transparent",cursor:"pointer",color:"#888780"}}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
        <BtnPrimary onClick={add} style={{width:"100%",padding:"11px"}}>명예의 전당 추가</BtnPrimary>
      </Card>
    </div>
  );
}

function StudentManage({students,setStudents}){
  const [showForm,setShowForm]   = useState(false);
  const [editTarget,setEditTarget] = useState(null); // null=추가, student=수정
  const [form,setForm]           = useState({name:"",cls:"A",course:"",grade:"",phone:"",school:"",timetable:"",password:"0000",parent_phone:""});
  const [successMsg,setSuccessMsg] = useState("");
  const [filterCls,setFilterCls] = useState("all");
  const [search,setSearch]       = useState("");
  const clsColor = {A:"blue",B:"green",C:"amber",D:"purple",E:"red",F:"gray"};

  const openAdd=()=>{
    setEditTarget(null);
    setForm({name:"",cls:"A",course:"",grade:"",phone:"",school:"",timetable:"",password:"0000",parent_phone:""});
    setShowForm(true);
  };

  const openEdit=(s)=>{
    setEditTarget(s);
    setForm({name:s.name,cls:s.cls,course:s.course||"",grade:s.grade||"",phone:s.phone||"",school:s.school||"",timetable:s.timetable||"",password:s.password||"0000",parent_phone:s.parent_phone||""});
    setShowForm(true);
  };

  const save=async()=>{
    if(!form.name.trim()){alert("이름을 입력해주세요.");return;}
    if(!form.password.trim()){alert("비밀번호를 입력해주세요.");return;}
    if(editTarget){
      // 수정
      const {error}=await supabase.from("students").update({
        name:form.name, cls:form.cls, course:form.course,
        grade:form.grade, phone:form.phone, school:form.school,
        timetable:form.timetable, password:form.password, parent_phone:form.parent_phone,
      }).eq("id",editTarget.id);
      if(error){alert("저장 중 오류가 발생했습니다.");return;}
      const updated=students.map(s=>s.id===editTarget.id?{...s,...form}:s);
      STUDENTS=updated;
      setStudents(updated);
      setSuccessMsg(`"${form.name}" 정보가 수정되었습니다.`);
    } else {
      // 추가
      const {data,error}=await supabase.from("students").insert({
        name:form.name, cls:form.cls, course:form.course,
        grade:form.grade, phone:form.phone, school:form.school,
        timetable:form.timetable, password:form.password, parent_phone:form.parent_phone, status:"ok",
      }).select().single();
      if(error){alert("저장 중 오류가 발생했습니다.");return;}
      const updated=[...students,data];
      STUDENTS=updated;
      setStudents(updated);
      setSuccessMsg(`"${form.name}" 학생이 추가되었습니다!`);
    }
    setShowForm(false);
    setTimeout(()=>setSuccessMsg(""),3000);
  };

  const deleteStudent=async(s)=>{
    if(!window.confirm(`"${s.name}" 학생을 삭제할까요?\n\n⚠️ 학생 정보만 삭제되며 시험 기록, 출석, 채점 기록은 유지됩니다.`))return;
    const {error}=await supabase.from("students").delete().eq("id",s.id);
    if(error){alert("삭제 중 오류가 발생했습니다.");return;}
    const updated=students.filter(x=>x.id!==s.id);
    STUDENTS=updated;
    setStudents(updated);
    setSuccessMsg(`"${s.name}" 학생이 삭제되었습니다. 기록은 유지됩니다.`);
    setTimeout(()=>setSuccessMsg(""),3000);
  };

  const filtered=students.filter(s=>
    (filterCls==="all"||s.cls===filterCls)&&
    (!search||s.name.includes(search))
  );

  return(
    <div>
      <SuccessBox msg={successMsg}/>

      <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
        <ClassFilter value={filterCls} onChange={setFilterCls}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="이름 검색..."
          style={{fontSize:13,padding:"5px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",background:"white",flex:1,minWidth:120}}/>
        <BtnPrimary onClick={openAdd}>+ 학생 추가</BtnPrimary>
      </div>

      {/* 추가/수정 폼 */}
      {showForm&&(
        <Card mb={16}>
          <SectionTitle>{editTarget?"학생 정보 수정":"새 학생 추가"}</SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            {[
              ["이름 *","name","예: 홍길동","text"],
              ["비밀번호 *","password","학생 로그인 비밀번호","text"],
              ["학교","school","예: 서울중학교","text"],
              ["학년","grade","예: 중등 2학년","text"],
              ["학생 연락처","phone","예: 010-1234-5678","text"],
              ["학부모 연락처","parent_phone","예: 010-9876-5432","text"],
              ["시간표","timetable","예: 월·수·금 18:00","text"],
              ["수강 과정","course","예: 중급 문법","text"],
            ].map(([label,key,placeholder])=>(
              <div key={key}>
                <div style={{fontSize:12,color:"#888780",marginBottom:4}}>{label}</div>
                <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={placeholder}
                  style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
              </div>
            ))}
            <div>
              <div style={{fontSize:12,color:"#888780",marginBottom:4}}>반</div>
              <div style={{display:"flex",gap:6}}>
                {["A","B","C","D","E","F"].map(c=>(
                  <button key={c} onClick={()=>setForm({...form,cls:c})}
                    style={{flex:1,padding:"8px",borderRadius:8,cursor:"pointer",border:`0.5px solid ${form.cls===c?"#185FA5":"#D3D1C7"}`,background:form.cls===c?"#E6F1FB":"white",color:form.cls===c?"#185FA5":"#888780",fontWeight:500,fontSize:11}}>
                    {clsLabel(c)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <BtnSecondary onClick={()=>setShowForm(false)}>취소</BtnSecondary>
            <BtnPrimary onClick={save}>{editTarget?"수정 완료":"추가 완료"}</BtnPrimary>
          </div>
        </Card>
      )}

      {/* 학생 목록 */}
      <div style={{border:"0.5px solid #D3D1C7",borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"#F1EFE8"}}>
            {["이름","반","학년","학교","시간표","학부모","비밀번호",""].map((h,i)=>(
              <th key={i} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:500,color:"#888780",borderBottom:"0.5px solid #D3D1C7"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.length===0?(
              <tr><td colSpan={7} style={{padding:"2rem",textAlign:"center",color:"#888780",fontSize:13}}>학생이 없어요</td></tr>
            ):filtered.map((s,i)=>(
              <tr key={s.id} style={{borderBottom:"0.5px solid #D3D1C7"}}
                onMouseEnter={e=>e.currentTarget.style.background="#F1EFE8"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"8px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Avatar name={s.name} idx={i} size={28}/>
                    <span style={{fontWeight:500}}>{s.name}</span>
                  </div>
                </td>
                <td style={{padding:"8px 12px"}}><Badge label={clsLabel(s.cls)} type={clsColor[s.cls]||"gray"}/></td>
                <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{s.grade||"—"}</td>
                <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{s.school||"—"}</td>
                <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{s.timetable||"—"}</td>
                <td style={{padding:"8px 12px",color:"#888780",fontSize:12}}>{s.parent_phone||"—"}</td>
                <td style={{padding:"8px 12px"}}>
                  <span style={{fontSize:12,background:"#F1EFE8",padding:"2px 8px",borderRadius:6,color:"#5F5E5A",fontFamily:"monospace"}}>{s.password||"0000"}</span>
                </td>
                <td style={{padding:"8px 12px"}}>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>openEdit(s)} style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:"0.5px solid #85B7EB",background:"#E6F1FB",cursor:"pointer",color:"#0C447C"}}>수정</button>
                    <button onClick={()=>deleteStudent(s)} style={{fontSize:11,padding:"3px 10px",borderRadius:6,border:"0.5px solid #F09595",background:"#FCEBEB",cursor:"pointer",color:"#791F1F"}}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════
// 강사 지문 관리 (AI 변형문제용)
// ════════════════════════════════════════════════
// ════════════════════════════════════════════════
// 강사 지문 + 변형문제 관리
// ════════════════════════════════════════════════
function TeacherPassages(){
  const [passages,setPassages]=useState([]);
  const [selPassage,setSelPassage]=useState(null);
  const [view,setView]=useState("list");
  const [showPassageForm,setShowPassageForm]=useState(false);
  const [showQForm,setShowQForm]=useState(false);
  const [pForm,setPForm]=useState({title:"",content:"",cls:"전체"});
  const [qForm,setQForm]=useState({question_type:"빈칸",question:"",choices:["","","","",""],answer:1,explanation:""});
  const [questions,setQuestions]=useState([]);
  const [successMsg,setSuccessMsg]=useState("");
  useEffect(()=>{supabase.from("passages").select("*").order("created_at",{ascending:false}).then(({data})=>setPassages(data||[]));
  },[]);
  const loadQuestions=async(passage)=>{setSelPassage(passage);const {data}=await supabase.from("variant_questions").select("*").eq("passage_id",passage.id).order("created_at",{ascending:false});setQuestions(data||[]);setView("questions");};
  const addPassage=async()=>{if(!pForm.title.trim()||!pForm.content.trim()){alert("제목과 지문을 입력해주세요.");return;}const {data,error}=await supabase.from("passages").insert({title:pForm.title,content:pForm.content,cls:pForm.cls}).select().single();if(error){alert("오류가 발생했습니다.");return;}setPassages(prev=>[data,...prev]);setPForm({title:"",content:"",cls:"전체"});setShowPassageForm(false);setSuccessMsg("지문이 등록됐어요!");setTimeout(()=>setSuccessMsg(""),3000);};
  const delPassage=async(id)=>{if(!window.confirm("지문과 관련 문제를 모두 삭제할까요?"))return;await supabase.from("variant_questions").delete().eq("passage_id",id);await supabase.from("passages").delete().eq("id",id);setPassages(prev=>prev.filter(p=>p.id!==id));if(selPassage?.id===id){setSelPassage(null);setView("list");}};
  const addQuestion=async()=>{if(!qForm.question.trim()){alert("문제를 입력해주세요.");return;}if(qForm.choices.some(c=>!c.trim())){alert("선택지를 모두 입력해주세요.");return;}const {data,error}=await supabase.from("variant_questions").insert({passage_id:selPassage.id,passage_title:selPassage.title,question_type:qForm.question_type,question:qForm.question,choices:qForm.choices,answer:qForm.answer,explanation:qForm.explanation}).select().single();if(error){alert("오류가 발생했습니다.");return;}setQuestions(prev=>[data,...prev]);setQForm({question_type:"빈칸",question:"",choices:["","","","",""],answer:1,explanation:""});setShowQForm(false);setSuccessMsg("문제가 등록됐어요!");setTimeout(()=>setSuccessMsg(""),3000);};
  const delQuestion=async(id)=>{if(!window.confirm("이 문제를 삭제할까요?"))return;await supabase.from("variant_questions").delete().eq("id",id);setQuestions(prev=>prev.filter(q=>q.id!==id));};
  if(view==="questions"&&selPassage) return(
    <div>
      <SuccessBox msg={successMsg}/>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <button onClick={()=>setView("list")} style={{background:"transparent",border:"none",fontSize:18,cursor:"pointer",color:"#888780"}}>←</button>
        <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#2C2C2A"}}>{selPassage.title}</div><div style={{fontSize:12,color:"#888780"}}>문제 {questions.length}개</div></div>
        <BtnPrimary onClick={()=>setShowQForm(!showQForm)}>+ 문제 추가</BtnPrimary>
      </div>
      {showQForm&&(
        <Card mb={12}>
          <SectionTitle>새 변형문제</SectionTitle>
          <div style={{marginBottom:8}}><div style={{fontSize:12,color:"#888780",marginBottom:4}}>문제 유형</div>
            <select value={qForm.question_type} onChange={e=>setQForm({...qForm,question_type:e.target.value})} style={{width:"100%",fontSize:13,padding:"7px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}>
              {["빈칸","주제/제목","순서배열","요약문완성","어법","내용일치"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{marginBottom:8}}><div style={{fontSize:12,color:"#888780",marginBottom:4}}>문제 *</div>
            <textarea value={qForm.question} onChange={e=>setQForm({...qForm,question:e.target.value})} placeholder="문제 내용 입력..." rows={3} style={{width:"100%",fontSize:13,padding:"7px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",resize:"vertical",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:8}}><div style={{fontSize:12,color:"#888780",marginBottom:4}}>선택지 (5개) *</div>
            {qForm.choices.map((c,i)=>(<input key={i} value={c} onChange={e=>{const ch=[...qForm.choices];ch[i]=e.target.value;setQForm({...qForm,choices:ch});}} placeholder={`${i+1}번 선택지`} style={{width:"100%",fontSize:13,padding:"6px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box",marginBottom:4}}/>))}
          </div>
          <div style={{marginBottom:8}}><div style={{fontSize:12,color:"#888780",marginBottom:4}}>정답 번호 *</div>
            <select value={qForm.answer} onChange={e=>setQForm({...qForm,answer:parseInt(e.target.value)})} style={{width:"100%",fontSize:13,padding:"7px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}>
              {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}번</option>)}
            </select>
          </div>
          <div style={{marginBottom:10}}><div style={{fontSize:12,color:"#888780",marginBottom:4}}>해설 (선택)</div>
            <textarea value={qForm.explanation} onChange={e=>setQForm({...qForm,explanation:e.target.value})} placeholder="해설 입력..." rows={2} style={{width:"100%",fontSize:13,padding:"7px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",resize:"vertical",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:8}}><BtnPrimary onClick={addQuestion} style={{flex:1}}>등록</BtnPrimary><BtnSecondary onClick={()=>setShowQForm(false)} style={{flex:1}}>취소</BtnSecondary></div>
        </Card>
      )}
      {questions.length===0?(<div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13,background:"white",borderRadius:12,border:"0.5px solid #D3D1C7"}}>아직 문제가 없어요!</div>):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {questions.map((q,i)=>(
            <div key={q.id} style={{background:"white",borderRadius:10,padding:"12px 14px",border:"0.5px solid #D3D1C7"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div style={{display:"flex",gap:6,alignItems:"center"}}><Badge label={q.question_type} type="blue"/><span style={{fontSize:11,color:"#888780"}}>정답: {q.answer}번</span></div>
                <button onClick={()=>delQuestion(q.id)} style={{fontSize:11,color:"#791F1F",background:"#FCEBEB",border:"none",padding:"2px 8px",borderRadius:4,cursor:"pointer"}}>삭제</button>
              </div>
              <div style={{fontSize:13,color:"#2C2C2A",lineHeight:1.6}}>{i+1}. {q.question}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  return(
    <div>
      <SuccessBox msg={successMsg}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:15,fontWeight:600,color:"#2C2C2A"}}>지문 목록</div>
        <BtnPrimary onClick={()=>setShowPassageForm(!showPassageForm)}>+ 지문 추가</BtnPrimary>
      </div>
      {showPassageForm&&(
        <Card mb={16}>
          <SectionTitle>새 지문 추가</SectionTitle>
          <div style={{marginBottom:8}}><div style={{fontSize:12,color:"#888780",marginBottom:4}}>제목 *</div>
            <input value={pForm.title} onChange={e=>setPForm({...pForm,title:e.target.value})} placeholder="예: 2026 고1 3월 모의고사 31번" style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:8}}><div style={{fontSize:12,color:"#888780",marginBottom:4}}>공개 대상</div>
            <select value={pForm.cls} onChange={e=>setPForm({...pForm,cls:e.target.value})} style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",boxSizing:"border-box"}}>
              {["전체","A","B","C","D","E","F"].map(v=><option key={v} value={v}>{v==="전체"?"전체 공개":v+"반"}</option>)}
            </select>
          </div>
          <div style={{marginBottom:12}}><div style={{fontSize:12,color:"#888780",marginBottom:4}}>지문 내용 *</div>
            <textarea value={pForm.content} onChange={e=>setPForm({...pForm,content:e.target.value})} placeholder="영어 지문을 여기에 붙여넣으세요..." rows={6} style={{width:"100%",fontSize:13,padding:"8px 10px",borderRadius:8,border:"0.5px solid #D3D1C7",resize:"vertical",boxSizing:"border-box",lineHeight:1.8}}/>
          </div>
          <div style={{display:"flex",gap:8}}><BtnPrimary onClick={addPassage} style={{flex:1}}>등록하기</BtnPrimary><BtnSecondary onClick={()=>setShowPassageForm(false)} style={{flex:1}}>취소</BtnSecondary></div>
        </Card>
      )}
      {passages.length===0?(<div style={{textAlign:"center",padding:"3rem",color:"#888780",fontSize:13,background:"white",borderRadius:12,border:"0.5px solid #D3D1C7"}}>아직 등록된 지문이 없어요</div>):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {passages.map(p=>(
            <div key={p.id} style={{background:"white",borderRadius:12,padding:"14px 16px",border:"0.5px solid #D3D1C7",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{flex:1,cursor:"pointer"}} onClick={()=>loadQuestions(p)}>
                <div style={{fontSize:14,fontWeight:600,color:"#2C2C2A"}}>{p.title}</div>
                <div style={{fontSize:11,color:"#888780",marginTop:3}}>{p.cls==="전체"?"전체 공개":p.cls+"반"} · {p.created_at?.split("T")[0]}</div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button onClick={()=>loadQuestions(p)} style={{fontSize:12,color:"#185FA5",background:"#E6F1FB",border:"none",padding:"5px 12px",borderRadius:6,cursor:"pointer"}}>문제 관리</button>
                <button onClick={()=>delPassage(p.id)} style={{fontSize:12,color:"#791F1F",background:"#FCEBEB",border:"none",padding:"5px 12px",borderRadius:6,cursor:"pointer"}}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
const NAV_ITEMS=[
  {id:"dashboard",label:"대시보드"},{id:"attendance",label:"출석 체크"},
  {id:"scores",label:"점수 입력"},{id:"homework",label:"과제물 관리"},
  {id:"grading",label:"채점"},{id:"report",label:"리포트"},
  {id:"halloffame",label:"명예의 전당"},{id:"clinic",label:"클리닉 신청"},
  {id:"students",label:"학생 관리"},{id:"qna",label:"Q&A"},{id:"reviews",label:"리뷰 관리"},{id:"vocab",label:"단어퀴즈"},{id:"points",label:"포인트"},{id:"passages",label:"AI 지문"},
];

function TeacherApp({onLogout,files,setFiles,banner,setBanner,hallOfFame,setHallOfFame,attendanceData,setAttendanceData,scoresData,setScoresData,students,setStudents}){
  const [activeNav,setActiveNav]=useState("dashboard");
  const [selectedStudent,setSelectedStudent]=useState(null);
  const [pendingCount,setPendingCount]=useState(0);
  const [qnaCount,setQnaCount]=useState(0);
  const [reviewCount,setReviewCount]=useState(0);
  const handleSelectStudent=(student)=>{setSelectedStudent(student);setActiveNav("detail");};

  useEffect(()=>{
    const fetchPending=async()=>{
      const {count}=await supabase.from("clinic_requests").select("*",{count:"exact",head:true}).eq("status","pending");
      setPendingCount(count||0);
    };
    const fetchQna=async()=>{
      const {count}=await supabase.from("questions").select("*",{count:"exact",head:true}).is("answer",null);
      setQnaCount(count||0);
    };
    const fetchReviews=async()=>{
      const {count}=await supabase.from("reviews").select("*",{count:"exact",head:true}).eq("status","pending");
      setReviewCount(count||0);
    };
    fetchPending();fetchQna();fetchReviews();
    const channel=supabase.channel("pending_count")
      .on("postgres_changes",{event:"*",schema:"public",table:"clinic_requests"},fetchPending)
      .on("postgres_changes",{event:"*",schema:"public",table:"questions"},fetchQna)
      .on("postgres_changes",{event:"*",schema:"public",table:"reviews"},fetchReviews)
      .subscribe();
    return ()=>supabase.removeChannel(channel);
  },[]);

  const renderContent=()=>{
    if(activeNav==="detail"&&selectedStudent) return <StudentDetail student={selectedStudent} onBack={()=>{setSelectedStudent(null);setActiveNav("dashboard");}}/>;
    switch(activeNav){
      case "dashboard":  return <Dashboard onSelectStudent={handleSelectStudent} attendanceData={attendanceData} scoresData={scoresData}/>;
      case "attendance": return <Attendance attendanceData={attendanceData} setAttendanceData={setAttendanceData}/>;
      case "scores":     return <ScoreEntry scoresData={scoresData} setScoresData={setScoresData}/>;
      case "homework":   return <HomeworkManage files={files} setFiles={setFiles}/>;
      case "grading":    return <Grading/>;
      case "report":     return <Report attendanceData={attendanceData} scoresData={scoresData}/>;
      case "halloffame": return <HallOfFameManage hallOfFame={hallOfFame} setHallOfFame={setHallOfFame}/>;
      case "clinic":     return <ClinicManage/>;
      case "students":   return <StudentManage students={students} setStudents={setStudents}/>;
      case "qna":        return <TeacherQnA/>;
      case "reviews":    return <TeacherReviews/>;
      case "vocab":      return <TeacherVocab/>;
      case "points":     return <TeacherPoints/>;
      case "passages":   return <TeacherPassages/>;
      default:           return null;
    }
  };
  return(
    <div style={{minHeight:"100vh",background:"#F1EFE8",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      <header style={{background:"#185FA5",padding:"0 20px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{color:"#E6F1FB",fontWeight:500,fontSize:16}}>English Academy</span>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{color:"#85B7EB",fontSize:12}}>강사 모드</span>
          <button onClick={onLogout} style={{fontSize:12,color:"#85B7EB",background:"transparent",border:"none",cursor:"pointer"}}>로그아웃</button>
        </div>
      </header>
      <div style={{background:"#0F6E56",padding:"8px 20px",display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:12,color:"#9FE1CB",flexShrink:0}}>📢 학생 배너:</span>
        <input
          value={banner}
          onChange={e=>{
            setBanner(e.target.value);
            supabase.from("settings").update({value:e.target.value}).eq("key","banner");
          }}
          placeholder="학생 화면 상단에 표시할 공지를 입력하세요"
          style={{flex:1,fontSize:12,padding:"4px 10px",borderRadius:6,border:"none",background:"rgba(255,255,255,0.15)",color:"white",outline:"none"}}
        />
        <span style={{fontSize:11,color:"#5DCAA5",flexShrink:0}}>실시간 반영</span>
      </div>
      <nav style={{background:"white",borderBottom:"0.5px solid #D3D1C7",padding:"0 20px",display:"flex",overflowX:"auto"}}>
        {NAV_ITEMS.map(item=>(<button key={item.id} onClick={()=>{setActiveNav(item.id);setSelectedStudent(null);}} style={{padding:"12px 16px",fontSize:13,cursor:"pointer",background:"transparent",border:"none",borderBottom:activeNav===item.id?"2px solid #185FA5":"2px solid transparent",color:activeNav===item.id?"#185FA5":"#888780",fontWeight:activeNav===item.id?500:400,whiteSpace:"nowrap",position:"relative"}}>
          {item.label}
          {item.id==="clinic"&&pendingCount>0&&(
            <span style={{position:"absolute",top:6,right:2,width:16,height:16,borderRadius:"50%",background:"#E24B4A",color:"white",fontSize:9,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center"}}>{pendingCount}</span>
          )}
          {item.id==="qna"&&qnaCount>0&&(
            <span style={{position:"absolute",top:6,right:2,width:16,height:16,borderRadius:"50%",background:"#E24B4A",color:"white",fontSize:9,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center"}}>{qnaCount}</span>
          )}
          {item.id==="reviews"&&reviewCount>0&&(
            <span style={{position:"absolute",top:6,right:2,width:16,height:16,borderRadius:"50%",background:"#E24B4A",color:"white",fontSize:9,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center"}}>{reviewCount}</span>
          )}
        </button>))}
      </nav>
      <main style={{maxWidth:960,margin:"0 auto",padding:"20px 16px"}}>{renderContent()}</main>
    </div>
  );
}

// ════════════════════════════════════════════════
// 메인 앱
// ════════════════════════════════════════════════
export default function App(){
  const saveSession=(m,s)=>{try{if(m)sessionStorage.setItem("app_mode",m);else sessionStorage.removeItem("app_mode");if(s)sessionStorage.setItem("app_student",JSON.stringify(s));else sessionStorage.removeItem("app_student");}catch(e){}};
  const [mode,setMode]=useState(()=>{try{return sessionStorage.getItem("app_mode")||null;}catch(e){return null;}});
  const [student,setStudent]=useState(()=>{try{const s=sessionStorage.getItem("app_student");return s?JSON.parse(s):null;}catch(e){return null;}});
  const [students,setStudents]=useState([]);
  const [files,setFiles]=useState([]);
  const [banner,setBanner]=useState("📢 이번 주 단어시험은 목요일입니다. 열심히 준비해요!");
  const [hallOfFame,setHallOfFame]=useState([]);
  const [clinicRequests,setClinicRequests]=useState([]);
  const [attendanceData,setAttendanceData]=useState({});
  const [scoresData,setScoresData]=useState({});
  const [loading,setLoading]=useState(true);
  const [exitToast,setExitToast]=useState(false); // 종료 안내 토스트

  // 뒤로가기 두 번 눌러야 종료
  useEffect(()=>{
    // PWA/브라우저 히스토리 스택 추가
    window.history.pushState(null, "", window.location.href);
    let exitTimer = null;
    const handlePopState=()=>{
      // 히스토리 다시 쌓기 (뒤로가기 막기)
      window.history.pushState(null, "", window.location.href);
      if(exitToast){
        // 두 번째 뒤로가기 → 종료
        window.close();
        // window.close()가 안 되는 경우 대비
        window.location.href = "about:blank";
      } else {
        // 첫 번째 뒤로가기 → 안내 표시
        setExitToast(true);
        clearTimeout(exitTimer);
        exitTimer = setTimeout(()=>setExitToast(false), 2500);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return ()=>{
      window.removeEventListener("popstate", handlePopState);
      clearTimeout(exitTimer);
    };
  },[exitToast]);

  useEffect(()=>{
    const loadAll=async()=>{
      // 학생 목록 (가장 먼저 로드 — 다른 데이터에서 참조)
      const {data:sts}=await supabase.from("students").select("*").order("cls").order("name");
      if(sts){
        STUDENTS=sts; // 전역 참조 업데이트
        setStudents(sts);
      }

      // 과제물
      const {data:hw}=await supabase.from("homework_files").select("*").order("created_at",{ascending:false});
      if(hw) setFiles(hw.map(f=>({...f,isNew:f.is_new,desc:f.description})));

      // 배너
      const {data:s}=await supabase.from("settings").select("value").eq("key","banner").single();
      if(s) setBanner(s.value);

      // 명예의 전당
      const {data:hof}=await supabase.from("hall_of_fame").select("*").order("order_num");
      if(hof) setHallOfFame(hof);

      // 출석 데이터
      const {data:att}=await supabase.from("attendance").select("*").order("date",{ascending:false});
      if(att){
        const grouped={};
        att.forEach(r=>{
          if(!grouped[r.student_id]) grouped[r.student_id]=[];
          grouped[r.student_id].push(r);
        });
        setAttendanceData(grouped);
      }

      // 점수 데이터
      const {data:sc}=await supabase.from("scores").select("*").order("created_at",{ascending:false});
      if(sc){
        const grouped={};
        sc.forEach(r=>{
          if(!grouped[r.student_id]) grouped[r.student_id]=[];
          grouped[r.student_id].push(r);
        });
        setScoresData(grouped);
      }

      setLoading(false);
    };
    loadAll();
  },[]);

  if(loading) return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0a0a14 0%,#0e1020 40%,#080c18 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"-apple-system,'Apple SD Gothic Neo',sans-serif",flexDirection:"column"}}>
      <style>{`
        @keyframes splashPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.75;transform:scale(0.94)}}
        .splash-icon{animation:splashPulse 1.6s ease-in-out infinite}
      `}</style>
      <div className="splash-icon" style={{width:88,height:88,borderRadius:24,background:"linear-gradient(135deg,#2D5BE3,#5B8DEF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,marginBottom:20,boxShadow:"0 8px 32px rgba(45,91,227,0.4)"}}>📚</div>
      <div style={{fontSize:20,fontWeight:700,color:"white",marginBottom:6,letterSpacing:"-0.02em"}}>박홍규 영어</div>
      <div style={{fontSize:13,color:"rgba(255,255,255,0.35)"}}>English Academy</div>
    </div>
  );

  // 종료 안내 토스트 UI (전역 — 어느 화면에서나 표시)
  const ExitToast = exitToast ? (
    <div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",background:"rgba(30,30,30,0.92)",color:"white",padding:"12px 24px",borderRadius:99,fontSize:13,fontWeight:500,zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.3)",animation:"fadeIn 0.2s ease"}}>
      한 번 더 누르면 앱이 종료됩니다
    </div>
  ) : null;

  if(mode==="teacher") return <>{ExitToast}<TeacherApp onLogout={()=>{setMode(null);saveSession(null,null);}} files={files} setFiles={setFiles} banner={banner} setBanner={setBanner} hallOfFame={hallOfFame} setHallOfFame={setHallOfFame} attendanceData={attendanceData} setAttendanceData={setAttendanceData} scoresData={scoresData} setScoresData={setScoresData} students={students} setStudents={setStudents}/></>;
  if(mode==="student"&&student) return <>{ExitToast}<StudentApp student={student} onLogout={()=>{setMode(null);setStudent(null);saveSession(null,null);}} files={files} banner={banner} hallOfFame={hallOfFame} clinicRequests={clinicRequests} setClinicRequests={setClinicRequests} attendanceData={attendanceData} scoresData={scoresData}/></>;
  return <>{ExitToast}<LoginScreen onTeacherLogin={()=>{setMode("teacher");saveSession("teacher",null);}} onStudentLogin={(s)=>{setStudent(s);setMode("student");saveSession("student",s);}}/></>;
}
