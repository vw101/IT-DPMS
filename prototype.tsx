import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  LogOut, 
  Bell, 
  Search, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  MoreHorizontal,
  Filter,
  Calendar,
  Activity,
  Zap,
  ArrowRight,
  Target,
  AlertTriangle,
  Edit,
  Home
} from 'lucide-react';

// --- 模拟数据 (Mock Data) ---
const MOCK_PROJECTS = [
  { id: 1, name: '21V 核心迁移 Alpha', owner: 'Sarah Connor', progress: 75, status: 'In Progress', members: 8, urgentCount: 2, budget: '$1.2M' },
  { id: 2, name: 'SAP 集成二期', owner: 'John Smith', progress: 30, status: 'Pending', members: 12, urgentCount: 0, budget: '$850k' },
  { id: 3, name: '云安全审计', owner: 'Mike Ross', progress: 90, status: 'UAT', members: 4, urgentCount: 1, budget: '$320k' },
  { id: 4, name: 'HR 门户重构', owner: 'Rachel Zane', progress: 10, status: 'In Progress', members: 6, urgentCount: 3, budget: '$500k' },
];

const MOCK_URGENT_ITEMS = [
  { id: 104, title: '防火墙规则更新', project: '21V 核心迁移 Alpha', due: '剩 1 天', daysLeft: 1, status: 'Pending', priority: 'Critical', owner: 'Mike R.' },
  { id: 101, title: '数据库架构定稿', project: '21V 核心迁移 Alpha', due: '剩 2 天', daysLeft: 2, status: 'Pending', priority: 'High', owner: 'Sarah C.' },
  { id: 102, title: 'API 网关配置', project: 'HR 门户重构', due: '剩 3 天', daysLeft: 3, status: 'In Progress', priority: 'High', owner: 'Rachel Z.' },
  { id: 103, title: '用户验收签字', project: '云安全审计', due: '剩 4 天', daysLeft: 4, status: 'UAT', priority: 'Medium', owner: 'John S.' },
  { id: 105, title: '生产环境证书续期', project: '基础设施', due: '剩 5 天', daysLeft: 5, status: 'Pending', priority: 'Medium', owner: 'DevOps' },
];

const MOCK_TIMELINE_ITEMS = [
  { id: 201, project: '21V 核心迁移 Alpha', item: '前端组件库开发', status: 'In Progress', start: '1月10日', end: '2月15日' },
  { id: 202, project: 'SAP 集成二期', item: '数据映射研讨会', status: 'Pending', start: '2月01日', end: '2月20日' },
  { id: 203, project: 'HR 门户重构', item: 'UX 研究与原型设计', status: 'Done', start: '1月05日', end: '1月25日' },
  { id: 204, project: '云安全审计', item: '渗透测试', status: 'UAT', start: '1月20日', end: '1月30日' },
];

const MOCK_MEMBERS = [
  { id: 1, name: '管理员用户', email: 'admin@pepsico.com', role: 'Admin', assigned: 12 },
  { id: 2, name: 'Sarah Connor', email: 'sarah.c@pepsico.com', role: 'Normal', assigned: 3 },
  { id: 3, name: 'John Smith', email: 'john.s@pepsico.com', role: 'Normal', assigned: 2 },
];

const ITEM_TREE_DATA = [
  {
    id: 1,
    name: '基础设施搭建',
    status: 'Done',
    dueDate: '2026-02-10',
    owner: '运维团队',
    children: [
      { id: 11, name: 'AWS VPC 配置', status: 'Done', dueDate: '2026-01-15', owner: 'Mike' },
      { id: 12, name: '负载均衡设置', status: 'Done', dueDate: '2026-01-20', owner: 'Mike' },
    ]
  },
  {
    id: 2,
    name: '认证模块',
    status: 'In Progress',
    dueDate: '2026-02-15',
    owner: '前端团队',
    children: [
      { id: 21, name: '登录界面开发', status: 'In Progress', dueDate: '2026-02-05', owner: 'Sarah' },
      { id: 22, name: 'OAuth 集成', status: 'Pending', dueDate: '2026-02-12', owner: 'John' },
    ]
  },
  {
    id: 3,
    name: '报表仪表盘',
    status: 'Pending',
    dueDate: '2026-03-01',
    owner: '数据团队',
    children: [] // No children
  }
];

// --- UX Design Tokens ---

const styles = {
  bg: "bg-[#F5F5F7]",
  card: "bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-white hover:border-[#007AFF]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300",
  primaryBtn: "bg-gradient-to-b from-[#007AFF] to-[#0062CC] text-white px-5 py-2.5 rounded-full font-medium text-[13px] shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all duration-200 flex items-center gap-1.5",
  h1: "text-[28px] font-bold text-[#1d1d1f] tracking-tight leading-tight",
  h2: "text-[22px] font-semibold text-[#1d1d1f] tracking-tight",
  h3: "text-[13px] font-bold text-[#636366] tracking-wide uppercase",
  body: "text-[15px] text-[#636366] leading-relaxed",
  input: "w-full px-4 py-3.5 bg-[#F2F2F7] border border-transparent rounded-[14px] text-[#1d1d1f] placeholder-[#86868b] focus:bg-white focus:border-[#007AFF]/30 focus:shadow-[0_4px_12px_rgba(0,122,255,0.1)] outline-none transition-all duration-200",
};

// --- 组件 (Components) ---

const StatusBadge = ({ status }) => {
  const config = {
    'Done': { bg: 'bg-[#34C759]/10', text: 'text-[#248A3D]', label: '已完成' },
    'In Progress': { bg: 'bg-[#007AFF]/10', text: 'text-[#007AFF]', label: '进行中' },
    'Pending': { bg: 'bg-[#8E8E93]/10', text: 'text-[#636366]', label: '待处理' },
    'UAT': { bg: 'bg-[#AF52DE]/10', text: 'text-[#893FB5]', label: 'UAT测试' },
  };

  const style = config[status] || config['Pending'];

  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide flex items-center gap-1.5 w-fit ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Done' ? 'bg-[#34C759]' : status === 'In Progress' ? 'bg-[#007AFF]' : status === 'UAT' ? 'bg-[#AF52DE]' : 'bg-[#8E8E93]'}`}></span>
      {style.label}
    </span>
  );
};

// 1. 登录页面
const LoginPage = ({ onLogin }) => (
  <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4 relative overflow-hidden">
    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px]"></div>
    <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-400/5 rounded-full blur-[100px]"></div>

    <div className="w-full max-w-[380px] z-10 animate-fade-in-up">
      <div className="text-center mb-10">
        <div className="h-[72px] w-[72px] bg-white rounded-[20px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/10">
          <Activity className="h-9 w-9 text-[#007AFF]" />
        </div>
        <h1 className="text-[34px] font-bold text-[#1d1d1f] tracking-tight">IT Delivery</h1>
        <p className="text-[15px] text-[#636366] mt-2">PepsiCo 智能交付中台</p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-white">
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <div className="space-y-4">
            <input 
              type="email" 
              defaultValue="admin@pepsico.com"
              className={styles.input}
              placeholder="企业账号 (SSO)"
            />
            <input 
              type="password" 
              defaultValue="password"
              className={styles.input}
              placeholder="密码"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-[#1d1d1f] hover:bg-black text-white py-4 rounded-[16px] font-semibold text-[15px] transition-all transform active:scale-[0.98] shadow-lg shadow-black/10 mt-2 flex items-center justify-center gap-2"
          >
            安全登录 <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
      
      <div className="mt-8 text-center flex items-center justify-center gap-2">
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
        <p className="text-[12px] text-[#86868b] font-medium">System Operational</p>
      </div>
    </div>
  </div>
);

// 2. 交付全景图 (Dynamic Urgent View)
const DashboardView = () => {
  const sortedUrgentItems = [...MOCK_URGENT_ITEMS].sort((a, b) => a.daysLeft - b.daysLeft);
  const urgentCount = sortedUrgentItems.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className={styles.h1}>风险预警中心</h2>
          <p className={styles.body}>当前共有 <span className="text-[#FF3B30] font-bold">{urgentCount}</span> 个紧急交付事项需要关注。</p>
        </div>
        <div className="flex items-center gap-3">
           <button className={styles.primaryBtn}>
              <Plus className="h-4 w-4" /> 创建任务
           </button>
        </div>
      </div>

      {/* Dynamic Urgent Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-[#FF3B30]">
              <Zap className="h-5 w-5 fill-current animate-pulse" />
              <h3 className="text-[15px] font-bold tracking-tight uppercase">紧急交付队列 ({urgentCount})</h3>
           </div>
           <span className="text-[12px] text-[#86868b] bg-white px-3 py-1 rounded-full border border-[#E5E5EA]">
             按截止日期自动排序
           </span>
        </div>

        <div className={`grid gap-5 ${
            urgentCount <= 2 ? 'grid-cols-1 md:grid-cols-2' : 
            urgentCount === 3 ? 'grid-cols-1 md:grid-cols-3' : 
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
          
          {sortedUrgentItems.map(item => (
            <div key={item.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-red-100 hover:shadow-[0_8px_30px_rgba(255,59,48,0.15)] hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[160px]">
              
              {item.daysLeft <= 1 && (
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors"></div>
              )}

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold tracking-wide border ${
                  item.daysLeft <= 1 
                    ? 'bg-[#FF3B30] text-white border-[#FF3B30] shadow-md shadow-red-500/30' 
                    : 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20'
                }`}>
                  <Clock className="h-3.5 w-3.5" />
                  {item.due}
                </div>
                {item.priority === 'Critical' && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF3B30]"></span>
                  </span>
                )}
              </div>
              
              <div className="relative z-10">
                <h4 className={`font-bold text-[#1d1d1f] leading-snug mb-1 group-hover:text-[#007AFF] transition-colors ${urgentCount <= 3 ? 'text-[18px]' : 'text-[16px]'}`}>
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 text-[#86868b] text-[13px]">
                   <Briefcase className="h-3.5 w-3.5" />
                   {item.project}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#F5F5F7] flex justify-between items-center relative z-10">
                 <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-[#F2F2F7] flex items-center justify-center text-[10px] font-bold text-[#636366]">
                       {item.owner.charAt(0)}
                    </div>
                    <span className="text-[12px] text-[#636366]">{item.owner}</span>
                 </div>
                 <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#F2F2F7] hover:bg-[#E5E5EA] p-1.5 rounded-lg text-[#1d1d1f]">
                    <ArrowRight className="h-4 w-4" />
                 </button>
              </div>
            </div>
          ))}

          {urgentCount === 0 && (
            <div className="col-span-full py-12 bg-white rounded-[24px] border border-dashed border-[#E5E5EA] flex flex-col items-center justify-center text-center">
               <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
               </div>
               <h3 className="text-[16px] font-bold text-[#1d1d1f]">目前没有紧急风险</h3>
               <p className="text-[13px] text-[#86868b]">所有项目交付正常，请继续保持。</p>
            </div>
          )}
        </div>
      </div>

      {/* Project Timeline */}
      <div className={styles.card}>
        <div className="p-6 flex justify-between items-center border-b border-[#F5F5F7]">
          <h3 className={styles.h3}>Q1 交付进度总览</h3>
          <div className="flex gap-2">
             <div className="bg-[#F2F2F7] p-1 rounded-lg flex text-[12px] font-medium text-[#636366]">
                <button className="px-3 py-1 bg-white rounded shadow-sm text-[#1d1d1f]">时间轴</button>
                <button className="px-3 py-1 hover:text-[#1d1d1f]">列表</button>
             </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider bg-[#FAFAFA] border-b border-[#F5F5F7]">
              <tr>
                <th className="px-6 py-4 pl-8">项目名称</th>
                <th className="px-6 py-4">阶段节点</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4 w-1/3">里程碑进度</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {MOCK_TIMELINE_ITEMS.map(row => (
                <tr key={row.id} className="hover:bg-[#F5F5F7]/50 transition-colors border-b border-[#F5F5F7] last:border-0 group">
                  <td className="px-6 py-5 pl-8 font-semibold text-[#1d1d1f]">{row.project}</td>
                  <td className="px-6 py-5 text-[#636366]">{row.item}</td>
                  <td className="px-6 py-5"><StatusBadge status={row.status} /></td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#86868b] font-mono w-10 text-right">{row.start}</span>
                      <div className="h-2 flex-1 bg-[#F2F2F7] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${row.status === 'Done' ? 'bg-[#34C759]' : 'bg-[#007AFF]'}`} 
                          style={{ width: `${Math.random() * 60 + 20}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-[#86868b] font-mono w-10">{row.end}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 3. 项目列表视图
const ProjectListView = ({ onProjectClick }) => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <h2 className={styles.h1}>项目矩阵</h2>
      <button 
        className={styles.primaryBtn}
        onClick={() => alert("弹窗：新建项目")}
      >
        <Plus className="h-4 w-4" /> 新建项目
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MOCK_PROJECTS.map(project => (
        <div 
          key={project.id} 
          onClick={onProjectClick}
          className={`${styles.card} group cursor-pointer hover:-translate-y-1`}
        >
          <div className="h-32 bg-gradient-to-br from-[#F5F5F7] to-[#E5E5EA] p-6 flex flex-col justify-between relative overflow-hidden rounded-t-[20px]">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="flex justify-between items-start z-10">
               <div className="bg-white/90 backdrop-blur-md p-2.5 rounded-[12px] shadow-sm">
                 <Briefcase className="h-5 w-5 text-[#1d1d1f]" />
               </div>
               {project.urgentCount > 0 && (
                 <span className="bg-[#FF3B30] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                   <AlertCircle className="h-3 w-3" /> {project.urgentCount}
                 </span>
               )}
             </div>
             <div className="z-10">
                <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-wide">预算: {project.budget}</span>
             </div>
          </div>

          <div className="p-6">
            <h3 className="text-[18px] font-bold text-[#1d1d1f] mb-1 group-hover:text-[#007AFF] transition-colors">{project.name}</h3>
            <p className="text-[13px] text-[#636366] mb-6">PM: {project.owner}</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[12px] font-medium text-[#636366]">
                <span>总体完成度</span>
                <span className="text-[#1d1d1f] font-bold">{project.progress}%</span>
              </div>
              <div className="h-2 bg-[#F2F2F7] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#007AFF] to-[#5AC8FA] rounded-full" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-[#F5F5F7]">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 w-8 rounded-full bg-[#F5F5F7] border-[2px] border-white flex items-center justify-center text-[10px] font-medium text-[#636366]">
                    U{i+1}
                  </div>
                ))}
                <div className="h-8 w-8 rounded-full bg-[#F2F2F7] border-[2px] border-white flex items-center justify-center text-[10px] font-medium text-[#636366]">
                  +
                </div>
              </div>
              <StatusBadge status={project.status} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 4. 项目详情页 - Removed internal breadcrumbs, now handled in Top Bar
const ProjectDetailView = () => {
  const [expanded, setExpanded] = useState({ 1: true, 2: false });

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* 移除了内部的面包屑导航，因为现在在顶部栏显示了 */}

      <div className={styles.card}>
        <div className="p-6 border-b border-[#F5F5F7] flex justify-between items-center bg-[#FAFAFA]/50 rounded-t-[20px]">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
               <Target className="h-6 w-6" />
            </div>
            <div>
              <h2 className={styles.h2}>21V 核心迁移 Alpha</h2>
              <p className="text-[13px] text-[#636366] mt-0.5">WBS 任务分解结构</p>
            </div>
          </div>
          <button 
             className={styles.primaryBtn}
             onClick={() => alert("弹窗：新建事项")}
          >
            <Plus className="h-4 w-4" /> 添加任务项
          </button>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-12 gap-4 px-8 py-3 bg-[#FAFAFA] border-b border-[#F5F5F7] text-[11px] font-bold text-[#86868b] uppercase tracking-wider">
            <div className="col-span-5">任务名称</div>
            <div className="col-span-2">当前状态</div>
            <div className="col-span-2">截止日期</div>
            <div className="col-span-2">负责人</div>
            <div className="col-span-1 text-center">操作</div>
          </div>

          <div className="divide-y divide-[#F5F5F7]">
            {ITEM_TREE_DATA.map((item) => (
              <React.Fragment key={item.id}>
                {/* Parent Row */}
                <div className={`grid grid-cols-12 gap-4 px-8 py-4 items-center hover:bg-[#F5F5F7] transition-colors group ${expanded[item.id] ? 'bg-[#F5F5F7]/40' : ''}`}>
                  <div className="col-span-5 flex items-center">
                    <button 
                      onClick={() => toggleExpand(item.id)}
                      className={`mr-3 p-1 rounded-md hover:bg-[#E5E5EA] transition-colors text-[#636366] ${item.children.length === 0 ? 'invisible' : ''}`}
                    >
                      {expanded[item.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <span className="text-[14px] font-semibold text-[#1d1d1f]">{item.name}</span>
                  </div>
                  <div className="col-span-2"><StatusBadge status={item.status} /></div>
                  <div className="col-span-2 text-[13px] text-[#636366]">{item.dueDate}</div>
                  <div className="col-span-2 flex items-center">
                     <div className="h-7 w-7 rounded-full bg-[#E5E5EA] text-[#1d1d1f] flex items-center justify-center text-[10px] font-bold mr-2 border border-white">
                       {item.owner.charAt(0)}
                     </div>
                     <span className="text-[13px] text-[#636366]">{item.owner}</span>
                  </div>
                  <div className="col-span-1 flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="text-[#636366] hover:text-[#007AFF] p-1.5 transition-all" 
                      title="编辑"
                      onClick={() => alert(`弹窗：编辑 '${item.name}'`)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-[#007AFF] bg-[#007AFF]/10 p-1.5 rounded-full hover:bg-[#007AFF] hover:text-white transition-all" 
                      title="添加子事项"
                      onClick={() => alert(`弹窗：为 '${item.name}' 添加子事项`)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Child Row - Visual Indentation */}
                {expanded[item.id] && item.children.map(sub => (
                  <div key={sub.id} className="grid grid-cols-12 gap-4 px-8 py-3 items-center bg-white relative group hover:bg-[#F5F5F7] transition-colors">
                    <div className="col-span-5 flex items-center pl-16 relative">
                      {/* Connection Lines */}
                      <div className="absolute left-[42px] top-[-20px] bottom-[50%] w-[1px] bg-[#E5E5EA]"></div>
                      <div className="absolute left-[42px] top-[50%] w-3 h-[1px] bg-[#E5E5EA]"></div>
                      
                      <span className="text-[13px] text-[#636366] font-medium">{sub.name}</span>
                    </div>
                    <div className="col-span-2"><StatusBadge status={sub.status} /></div>
                    <div className="col-span-2 text-[13px] text-[#86868b]">{sub.dueDate}</div>
                    <div className="col-span-2 flex items-center">
                      <span className="text-[13px] text-[#86868b]">{sub.owner}</span>
                    </div>
                    <div className="col-span-1 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="text-[#636366] hover:text-[#007AFF] p-1.5 transition-all" 
                        title="编辑"
                        onClick={() => alert(`弹窗：编辑 '${sub.name}'`)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. 成员管理
const MemberManagementView = () => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <h2 className={styles.h1}>成员权限</h2>
      <button 
        className={styles.primaryBtn}
        onClick={() => alert("弹窗：添加成员")}
      >
        <Plus className="h-4 w-4" /> 邀请成员
      </button>
    </div>

    <div className={styles.card}>
      <table className="w-full text-left border-collapse">
        <thead className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider bg-[#FAFAFA] border-b border-[#F5F5F7]">
          <tr>
            <th className="px-6 py-4 pl-8">用户信息</th>
            <th className="px-6 py-4">系统角色</th>
            <th className="px-6 py-4">项目访问权</th>
            <th className="px-6 py-4 text-right">管理</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F5F5F7]">
          {MOCK_MEMBERS.map(member => (
            <tr key={member.id} className="hover:bg-[#F5F5F7] transition-colors group">
              <td className="px-6 py-5 pl-8">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#F2F2F7] text-[#636366] flex items-center justify-center font-bold mr-3 border border-[#E5E5EA]">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-[#1d1d1f] text-[14px]">{member.name}</div>
                    <div className="text-[#86868b] text-[12px]">{member.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <span className={`px-3 py-1 rounded-full text-[12px] font-medium border ${member.role === 'Admin' ? 'bg-[#AF52DE]/5 text-[#AF52DE] border-[#AF52DE]/20' : 'bg-[#636366]/5 text-[#636366] border-[#636366]/10'}`}>
                  {member.role === 'Admin' ? '系统管理员' : '普通成员'}
                </span>
              </td>
              <td className="px-6 py-5 text-[#636366] text-[13px]">
                {member.role === 'Admin' ? <span className="text-[#AF52DE] font-medium flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> 全局访问</span> : `${member.assigned} 个项目已授权`}
              </td>
              <td className="px-6 py-5 text-right">
                <button 
                  className="text-[#007AFF] bg-[#007AFF]/0 group-hover:bg-[#007AFF]/10 px-3 py-1.5 rounded-lg font-medium text-[12px] transition-all"
                  onClick={() => alert("弹窗：配置权限")}
                >
                  配置
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- 侧边栏 (macOS Sidebar Style - Enterprise) ---

const Sidebar = ({ activePage, setPage, userRole }) => (
  <div className="w-[260px] bg-[#F5F5F7]/95 backdrop-blur-2xl h-screen fixed left-0 top-0 flex flex-col border-r border-[#D1D1D6] z-50 pt-8 pb-6 select-none shadow-[2px_0_20px_rgba(0,0,0,0.02)]">
    
    <div className="px-6 mb-8 flex items-center gap-3">
      <div className="h-9 w-9 bg-gradient-to-br from-[#007AFF] to-[#0A84FF] text-white rounded-[10px] flex items-center justify-center shadow-md shadow-blue-500/20">
        <Activity className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-[16px] font-bold text-[#1d1d1f] tracking-tight leading-none">IT-PDMS</h1>
        <p className="text-[10px] text-[#86868b] font-medium mt-1 tracking-wide">ENTERPRISE EDITION</p>
      </div>
    </div>

    <nav className="flex-1 px-4 space-y-1">
      <div className="px-3 mb-2 text-[11px] font-bold text-[#86868b] uppercase tracking-wider opacity-60">Main Menu</div>
      {[
        { id: 'dashboard', icon: LayoutDashboard, label: '交付概览' },
        { id: 'projects', icon: Briefcase, label: '项目矩阵' },
        ...(userRole === 'Admin' ? [{ id: 'members', icon: Users, label: '成员权限' }] : [])
      ].map(item => (
        <button 
          key={item.id}
          onClick={() => setPage(item.id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-200 group ${
            (activePage === item.id || (item.id === 'projects' && activePage === 'project-detail'))
            ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/20' 
            : 'text-[#1d1d1f] hover:bg-black/5'
          }`}
        >
          <item.icon className={`h-4.5 w-4.5 ${(activePage === item.id || (item.id === 'projects' && activePage === 'project-detail')) ? 'text-white' : 'text-[#86868b] group-hover:text-[#1d1d1f]'}`} />
          {item.label}
          {(activePage === item.id || (item.id === 'projects' && activePage === 'project-detail')) && (
            <ChevronRight className="h-3.5 w-3.5 ml-auto text-white/50" />
          )}
        </button>
      ))}
    </nav>

    <div className="px-5 pt-5 border-t border-[#D1D1D6] mx-2">
      <div className="flex items-center gap-3 mb-4 p-2 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
        <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-[13px] font-bold text-[#1d1d1f] border border-[#E5E5EA] shadow-sm">
          A
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-[13px] font-semibold text-[#1d1d1f] truncate">管理员</p>
          <p className="text-[11px] text-[#86868b] truncate">admin@pepsico.com</p>
        </div>
      </div>
      <button className="flex items-center gap-2 text-[12px] font-medium text-[#636366] hover:text-red-600 transition-colors w-full px-3 py-2 rounded-lg hover:bg-red-50">
        <LogOut className="h-4 w-4" /> 安全退出
      </button>
    </div>
  </div>
);

const App = () => {
  const [currentPage, setCurrentPage] = useState('login'); 
  const [userRole, setUserRole] = useState('Admin'); 

  // --- Top Bar Breadcrumb Logic ---
  const renderTopBarLeft = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="flex items-center gap-2 text-[#1d1d1f]">
            <LayoutDashboard className="h-4 w-4 text-[#86868b]" />
            <span className="text-[14px] font-semibold">交付概览</span>
          </div>
        );
      case 'projects':
        return (
          <div className="flex items-center gap-2 text-[#1d1d1f]">
            <Briefcase className="h-4 w-4 text-[#86868b]" />
            <span className="text-[14px] font-semibold">项目矩阵</span>
          </div>
        );
      case 'project-detail':
        return (
          <div className="flex items-center gap-2 text-[13px] font-medium">
            <span 
              className="text-[#86868b] hover:text-[#1d1d1f] cursor-pointer transition-colors"
              onClick={() => setCurrentPage('projects')}
            >
              项目矩阵
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-[#C7C7CC]" />
            <span className="text-[#1d1d1f] bg-white/50 px-2 py-0.5 rounded-md border border-[#E5E5EA] shadow-sm">
              21V 核心迁移 Alpha
            </span>
          </div>
        );
      case 'members':
        return (
          <div className="flex items-center gap-2 text-[#1d1d1f]">
            <Users className="h-4 w-4 text-[#86868b]" />
            <span className="text-[14px] font-semibold">成员权限</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (currentPage === 'login') {
    return <LoginPage onLogin={() => setCurrentPage('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-[#1d1d1f] selection:bg-[#007AFF]/20 selection:text-[#007AFF]">
      <Sidebar activePage={currentPage} setPage={setCurrentPage} userRole={userRole} />
      
      <main className="ml-[260px] p-10 min-w-[1000px]">
        {/* Top Bar (Restored & Optimized) */}
        <div className="flex justify-between items-center mb-10 sticky top-0 z-40 py-3 -mt-3 bg-[#F5F5F7]/90 backdrop-blur-xl px-4 rounded-b-[20px] shadow-[0_1px_0_rgba(0,0,0,0.05)]">
          {/* Left Side: Contextual Breadcrumb */}
          <div className="flex-1 animate-fade-in">
             {renderTopBarLeft()}
          </div>

          {/* Right Side: Tools */}
          <div className="flex items-center gap-6">
            <button className="relative text-[#636366] hover:text-[#1d1d1f] transition-colors p-2 rounded-full hover:bg-white/60 shadow-sm hover:shadow-md active:scale-95 duration-200">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-2 h-2 w-2 bg-[#FF3B30] rounded-full border-2 border-[#F5F5F7]"></span>
            </button>
            <div className="w-[1px] h-5 bg-[#D1D1D6]"></div>
            <div className="flex items-center gap-2.5 text-[13px] font-medium text-[#636366] bg-white/80 px-3 py-1.5 rounded-full shadow-sm border border-[#E5E5EA]">
              <Calendar className="h-4 w-4 text-[#007AFF]" />
              <span>2026年1月27日</span>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="max-w-[1600px] mx-auto pb-12">
          {currentPage === 'dashboard' && <DashboardView />}
          {currentPage === 'projects' && <ProjectListView onProjectClick={() => setCurrentPage('project-detail')} />}
          {currentPage === 'project-detail' && <ProjectDetailView />}
          {currentPage === 'members' && <MemberManagementView />}
        </div>
      </main>
    </div>
  );
};

export default App;