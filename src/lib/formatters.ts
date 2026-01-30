/**
 * 文本格式化工具函数
 * 仅用于 UI 层显示，不影响数据库存储
 */

/**
 * 格式化 PM 姓名显示
 * 将 "ke.chen" 转换为 "Ke Chen"
 * 将 "cheng zhongnan" 转换为 "Cheng Zhongnan"
 */
export function formatPmName(name: string): string {
  if (!name) return ''
  
  // 处理带点号的格式 (ke.chen -> Ke Chen)
  if (name.includes('.')) {
    return name
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
  }
  
  // 处理空格分隔的格式 (cheng zhongnan -> Cheng Zhongnan)
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Sapphire Pro 语义色：左侧状态条（配合 border-l-4）
 * Pending -> 琥珀金 | In Progress -> 科技蓝 | Done -> 翡翠绿 | Risk/Error -> 红
 */
export function getStatusLeftBorderColor(status: string): string {
  const colorMap: Record<string, string> = {
    'Pending': 'border-l-amber-400',
    '待处理': 'border-l-amber-400',
    'In Progress': 'border-l-blue-500',
    '进行中': 'border-l-blue-500',
    'UAT': 'border-l-blue-500',
    'Done': 'border-l-emerald-500',
    '完成': 'border-l-emerald-500',
    'Risk': 'border-l-red-500',
    'Error': 'border-l-red-500',
  }
  return colorMap[status] || 'border-l-amber-400'
}
