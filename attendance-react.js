(function(){
  const h=React.createElement;
  const L=window.LucideReact||{};
  const {
    Clock3, Coffee, LogIn, LogOut, Play, Square, Timer, CalendarDays,
    FilePenLine, MessageSquareText, ChevronLeft, ChevronRight,
    CheckCircle2, AlertCircle, XCircle, MoreHorizontal
  }=L;

  const initialRows=[
    {id:1,date:'Mon, Sep 7',regular:8,overtime:0,break:45,status:'Approved',note:'Regular working day'},
    {id:2,date:'Tue, Sep 8',regular:8,overtime:1.5,break:45,status:'Approved',note:'Production support'},
    {id:3,date:'Wed, Sep 9',regular:7.5,overtime:0,break:60,status:'Pending',note:'Client meeting'},
    {id:4,date:'Thu, Sep 10',regular:8,overtime:2,break:45,status:'Approved',note:'Release activity'},
    {id:5,date:'Fri, Sep 11',regular:6.75,overtime:0,break:45,status:'Pending',note:''}
  ];

  const statusMap={
    Pending:{icon:AlertCircle,cls:'bg-amber-50 text-amber-700 ring-amber-200'},
    Approved:{icon:CheckCircle2,cls:'bg-emerald-50 text-emerald-700 ring-emerald-200'},
    Rejected:{icon:XCircle,cls:'bg-red-50 text-red-700 ring-red-200'}
  };

  function fmt(h){const x=Math.floor(h),m=Math.round((h-x)*60);return x?(m?x+'h '+m+'m':x+'h'):m+'m';}
  function nowText(){return new Date().toLocaleTimeString('en-IN',{hour12:false});}
  function dayKey(){return new Date().toISOString().slice(0,10);}

  function Icon({type,size=18}){const C=type;if(!C)return h('span',null);return h(C,{size,strokeWidth:2, 'aria-hidden':'true'});}

  function Status({value}){
    const s=statusMap[value]||statusMap.Pending, I=s.icon;
    return h('span',{className:'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset '+s.cls},h(I,{size:13}),value);
  }

  function Metric({icon,label,value,sub}){
    return h('div',{className:'rounded-xl border border-slate-800 bg-slate-950/70 p-4'},
      h('div',{className:'flex items-center gap-2 text-slate-400'},h(Icon,{type:icon,size:17}),h('span',{className:'text-xs'},label)),
      h('div',{className:'mt-2 text-xl font-bold text-white'},value),
      sub&&h('div',{className:'mt-1 text-xs text-slate-500'},sub)
    );
  }

  function AttendanceTimesheet(){
    const role=typeof state!=='undefined'?state.role:'employee';
    const empId=typeof state!=='undefined'?state.empId:null;
    const [clock,setClock]=React.useState(new Date());
    const [attendance,setAttendance]=React.useState(()=>{
      if(typeof state!=='undefined' && state.data && state.data.attendance)return state.data.attendance.slice();
      return [];
    });
    const [clocked,setClocked]=React.useState(()=>{
      const r=attendance.find(x=>x.emp===empId&&x.date===dayKey());return !!(r&&r.in&&!r.out);
    });
    const [onBreak,setOnBreak]=React.useState(false);
    const [breakCount,setBreakCount]=React.useState(0);
    const [breakSeconds,setBreakSeconds]=React.useState(0);
    const [breakStarted,setBreakStarted]=React.useState(null);
    const [edit,setEdit]=React.useState(null);
    const [note,setNote]=React.useState(null);
    const [rows,setRows]=React.useState(initialRows);
    const [weekOffset,setWeekOffset]=React.useState(0);

    React.useEffect(()=>{const t=setInterval(()=>setClock(new Date()),1000);return()=>clearInterval(t);},[]);
    React.useEffect(()=>{if(!breakStarted)return;const t=setInterval(()=>setBreakSeconds(Math.floor((Date.now()-breakStarted)/1000)),1000);return()=>clearInterval(t);},[breakStarted]);

    const today=attendance.find(x=>x.emp===empId&&x.date===dayKey());
    const workingHours=today&&today.in&&!today.out?Math.max(0,(clock.getHours()*60+clock.getMinutes()-(parseInt(today.in)||0)*60-(parseInt((today.in||'0:0').split(':')[1])||0))/60-breakSeconds/3600):0;
    const filtered=role==='admin'?attendance.slice().reverse():attendance.filter(x=>x.emp===empId).slice().reverse();
    const totals=rows.reduce((a,r)=>({regular:a.regular+r.regular,overtime:a.overtime+r.overtime,break:a.break+r.break}),{regular:0,overtime:0,break:0});

    function persist(next){setAttendance(next);if(typeof state!=='undefined'){state.data.attendance=next;save();}}
    function clockIn(){
      if(today&&today.in)return;
      const n=new Date().toTimeString().slice(0,5);let next=attendance.slice();
      let r=next.find(x=>x.emp===empId&&x.date===dayKey());
      if(!r){r={date:dayKey(),emp:empId,in:'',out:'',status:'Present'};next.push(r);}
      r.in=n;r.out='';r.status='Present';persist(next);setClocked(true);
    }
    function clockOut(){
      if(!today||!today.in||today.out)return;
      const n=new Date().toTimeString().slice(0,5);const next=attendance.map(x=>x===today?Object.assign({},x,{out:n}):x);persist(next);setClocked(false);setOnBreak(false);
    }
    function startBreak(){if(!clocked)return;setOnBreak(true);setBreakStarted(Date.now());setBreakCount(x=>x+1);}
    function endBreak(){setOnBreak(false);if(breakStarted)setBreakSeconds(x=>x);setBreakStarted(null);}
    function update(id,field,value){setRows(rs=>rs.map(r=>r.id===id?Object.assign({},r,{[field]:field==='regular'||field==='overtime'?Number(value):value}):r));}
    function shiftWeek(n){setWeekOffset(x=>x+n);}

    return h('div',{className:'min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 text-slate-900'},
      h('div',{className:'mx-auto max-w-7xl space-y-5'},
        h('header',{className:'flex flex-col gap-4 md:flex-row md:items-center md:justify-between'},
          h('div',null,
            h('div',{className:'mb-1 flex items-center gap-2 text-sm font-semibold text-blue-600'},h(Icon,{type:CalendarDays,size:16}),'Attendance & Timesheet'),
            h('h2',{className:'text-2xl font-bold sm:text-3xl'},role==='admin'?'Workforce Attendance & Timesheet':'My Attendance & Timesheet'),
            h('p',{className:'mt-1 text-sm text-slate-500'},'Live attendance, breaks, weekly hours and timesheet approvals.')
          ),
          h('div',{className:'flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm'},h(Icon,{type:Clock3,size:18}),h('span',{className:'font-mono text-sm font-semibold','aria-live':'polite'},clock.toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short'})))
        ),

        h('section',{className:'overflow-hidden rounded-2xl bg-slate-950 shadow-xl','aria-label':'Clock in widget'},
          h('div',{className:'grid lg:grid-cols-[1.35fr_1fr]'},
            h('div',{className:'p-6 sm:p-8 lg:p-10'},
              h('div',{className:'flex flex-wrap items-center justify-between gap-4'},
                h('div',null,h('p',{className:'text-sm text-slate-400'},"Today's attendance"),h('h3',{className:'mt-1 text-xl font-semibold text-white'},role==='admin'?'Attendance control center':'Good day, '+(typeof state!=='undefined'?state.user:'Employee'))),
                h('span',{className:'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 '+(onBreak?'bg-amber-500/10 text-amber-300 ring-amber-500/20':clocked?'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20':'bg-slate-800 text-slate-300 ring-slate-700')},h('span',{className:'h-2 w-2 rounded-full '+(onBreak?'bg-amber-400':clocked?'bg-emerald-400':'bg-slate-500')}),onBreak?'Break':clocked?'Clocked In':'Out')
              ),
              h('div',{className:'mt-8'},h('div',{className:'text-xs uppercase tracking-[0.2em] text-slate-500'},'Current Time'),h('div',{className:'mt-2 font-mono text-5xl font-bold tracking-tight text-white sm:text-6xl','aria-live':'polite'},nowText())),
              role==='employee'&&h('div',{className:'mt-7 flex flex-col gap-3 sm:flex-row'},
                !clocked&&!onBreak&&h('button',{onClick:clockIn,className:'inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400','aria-label':'Clock in'},h(Icon,{type:LogIn}), 'Clock In'),
                clocked&&!onBreak&&h(React.Fragment,null,h('button',{onClick:startBreak,className:'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-700'},h(Icon,{type:Coffee}),'Start Break'),h('button',{onClick:clockOut,className:'inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-400'},h(Icon,{type:LogOut}),'Clock Out')),
                onBreak&&h('button',{onClick:endBreak,className:'inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-400'},h(Icon,{type:Play}),'End Break')
              )
            ),
            h('div',{className:'border-t border-slate-800 bg-slate-900/80 p-6 sm:p-8 lg:border-l lg:border-t-0'},
              h('div',{className:'grid grid-cols-2 gap-3'},
                h(Metric,{icon:Timer,label:'Working Time',value:clocked?fmt(workingHours):today&&today.out?fmt(8):'0h 00m'}),
                h(Metric,{icon:Coffee,label:'Breaks',value:String(breakCount),sub:Math.floor(breakSeconds/60)+' min'}),
                h(Metric,{icon:LogIn,label:'Clock In',value:today&&today.in?today.in:'--:--'}),
                h(Metric,{icon:Square,label:'Daily Target',value:'8h 00m'})
              ),
              h('div',{className:'mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4'},h('div',{className:'flex justify-between text-xs text-slate-400'},h('span',null,'Daily target'),h('span',null,Math.min(100,Math.round((workingHours/8)*100))+'%')),h('div',{className:'mt-2 h-2 overflow-hidden rounded-full bg-slate-800'},h('div',{className:'h-full rounded-full bg-blue-500 transition-all',style:{width:Math.min(100,(workingHours/8)*100)+'%'}})))
            )
          )
        ),

        h('section',{className:'flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center'},
          h('div',null,h('h3',{className:'font-semibold'},'Weekly Timesheet'),h('p',{className:'text-sm text-slate-500'},'Review, edit and submit working hours.')),
          h('div',{className:'flex items-center gap-2'},h('button',{onClick:()=>shiftWeek(-1),className:'rounded-lg border border-slate-200 p-2 hover:bg-slate-50','aria-label':'Previous week'},h(Icon,{type:ChevronLeft})),h('div',{className:'min-w-[190px] rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-medium'},weekOffset===0?'Sep 7 – Sep 13, 2026':weekOffset<0?'Aug 31 – Sep 6, 2026':'Sep 14 – Sep 20, 2026'),h('button',{onClick:()=>shiftWeek(1),className:'rounded-lg border border-slate-200 p-2 hover:bg-slate-50','aria-label':'Next week'},h(Icon,{type:ChevronRight})))
        ),

        h('section',{className:'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm','aria-labelledby':'weekly-timesheet-heading'},
          h('div',{className:'flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center'},h('div',null,h('h3',{id:'weekly-timesheet-heading',className:'font-semibold'},'Timesheet Details'),h('p',{className:'text-sm text-slate-500'},'Regular hours, overtime, break deductions and approval status.')),h('button',{className:'inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800'},h(Icon,{type:CheckCircle2,size:16}),'Submit Timesheet')),
          h('div',{className:'overflow-x-auto'},h('table',{className:'w-full min-w-[900px] text-left text-sm'},
            h('thead',{className:'bg-slate-50 text-xs uppercase tracking-wide text-slate-500'},h('tr',null,['Date','Regular Hours','Overtime','Break Deduction','Status','Note / Actions'].map(x=>h('th',{key:x,className:'px-5 py-4 font-semibold'},x)))),
            h('tbody',{className:'divide-y divide-slate-100'},rows.map(r=>h('tr',{key:r.id,className:'hover:bg-slate-50'},
              h('td',{className:'px-5 py-4'},h('div',{className:'font-medium'},r.date),h('div',{className:'mt-1 text-xs text-slate-400'},r.note||'No note added')),
              h('td',{className:'px-5 py-4'},edit===r.id?h('input',{type:'number',step:'0.25',value:r.regular,onChange:e=>update(r.id,'regular',e.target.value),className:'w-24 rounded-lg border border-blue-300 px-3 py-2', 'aria-label':'Regular hours'}):h('span',{className:'font-semibold'},fmt(r.regular))),
              h('td',{className:'px-5 py-4'},r.overtime?h('span',{className:'rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700'},'+'+fmt(r.overtime)):h('span',{className:'text-slate-400'},'—')),
              h('td',{className:'px-5 py-4'},h('span',{className:'inline-flex items-center gap-1.5 text-slate-600'},h(Icon,{type:Coffee,size:14}),r.break+' min')),
              h('td',{className:'px-5 py-4'},h(Status,{value:r.status})),
              h('td',{className:'px-5 py-4'},h('div',{className:'flex items-center justify-end gap-1'},h('button',{onClick:()=>setEdit(edit===r.id?null:r.id),className:'rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600','aria-label':'Edit timesheet row'},h(Icon,{type:FilePenLine,size:17})),h('button',{onClick:()=>setNote(note===r.id?null:r.id),className:'rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600','aria-label':'Add note'},h(Icon,{type:MessageSquareText,size:17})),h('button',{className:'rounded-lg p-2 text-slate-500 hover:bg-slate-100','aria-label':'More actions'},h(Icon,{type:MoreHorizontal,size:17}))),note===r.id&&h('input',{value:r.note,onChange:e=>update(r.id,'note',e.target.value),placeholder:'Add a note...',className:'mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs', 'aria-label':'Timesheet note'}))
            ))),
            h('tfoot',{className:'border-t-2 border-slate-200 bg-slate-50'},h('tr',null,h('td',{className:'px-5 py-4 font-semibold'},'Weekly Total'),h('td',{className:'px-5 py-4 font-bold'},fmt(totals.regular)),h('td',{className:'px-5 py-4 font-bold text-purple-700'},'+'+fmt(totals.overtime)),h('td',{className:'px-5 py-4 font-semibold'},totals.break+' min'),h('td',{colSpan:2})))
          ))
        ),
        h('div',{className:'grid grid-cols-1 gap-3 sm:grid-cols-3'},
          h('div',{className:'rounded-xl border border-slate-200 bg-white p-4 shadow-sm'},h('p',{className:'text-xs uppercase tracking-wide text-slate-400'},'Regular'),h('p',{className:'mt-2 text-xl font-bold'},fmt(totals.regular))),
          h('div',{className:'rounded-xl border border-slate-200 bg-white p-4 shadow-sm'},h('p',{className:'text-xs uppercase tracking-wide text-slate-400'},'Overtime'),h('p',{className:'mt-2 text-xl font-bold text-purple-700'},fmt(totals.overtime))),
          h('div',{className:'rounded-xl border border-slate-200 bg-white p-4 shadow-sm'},h('p',{className:'text-xs uppercase tracking-wide text-slate-400'},'Break deductions'),h('p',{className:'mt-2 text-xl font-bold'},totals.break+' min'))
        ),
        role==='admin'&&h('section',{className:'rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900'},h('strong',null,'HR view: '), 'The table shows workforce attendance records. Employees get the live clock and personal timesheet controls.')
      )
    );
  }

  function mount(){
    const root=document.getElementById('attendanceReactRoot');
    if(!root||!window.ReactDOM)return;
    if(root.__mounted)return;root.__mounted=true;
    window.ReactDOM.createRoot(root).render(h(AttendanceTimesheet));
  }

  window.addEventListener('load',mount);
  new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});
  window.ProlificAttendanceTimesheet={AttendanceTimesheet,mount};
  window.attendance=function(){return '<div id="attendanceReactRoot"></div>';};
})();