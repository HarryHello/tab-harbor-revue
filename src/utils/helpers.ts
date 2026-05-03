/**
 * 从 URL 获取 favicon 地址
 */
export function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}/favicon.ico`;
  } catch {
    return '';
  }
}

/**
 * 获取字符串的首字母（大写）
 */
export function getInitial(str: string): string {
  return str.charAt(0).toUpperCase();
}

/**
 * 根据字符串生成随机颜色
 */
export function getRandomColor(str: string): string {
  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a', '#98d8c8',
    '#f7dc6f', '#bb8fce', '#85c1e2', '#f8b739', '#52b788',
    '#e63946', '#457b9d', '#2a9d8f', '#e9c46a', '#f4a261',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * URL 验证结果类型
 */
export type UrlValidationResult =
  | { valid: true; reason?: never }
  | { valid: false; reason: 'dangerous' | 'risky'; protocol: string };

/**
 * 验证 URL 是否安全
 * @returns 验证结果，包含是否有效以及原因
 */
export function validateUrl(url: string): UrlValidationResult {
  try {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol.toLowerCase();

    // 安全的协议
    if (['http:', 'https:'].includes(protocol)) {
      return { valid: true };
    }

    // 绝对危险的协议（直接执行代码）
    // 包括 javascript:, vbscript:, data: (可以包含脚本)
    if (['javascript:', 'vbscript:', 'data:'].includes(protocol)) {
      return { valid: false, reason: 'dangerous', protocol };
    }

    // 其他有风险的协议
    return { valid: false, reason: 'risky', protocol };
  } catch {
    return { valid: false, reason: 'risky', protocol: 'invalid' };
  }
}

/**
 * 验证 URL 是否安全（简化版本，只返回布尔值）
 */
export function isValidUrl(url: string): boolean {
  return validateUrl(url).valid;
}

/**
 * 处理 URL 打开的安全检查
 * @param url 要打开的 URL
 * @param actionType 操作类型（'open' 打开链接 或 'add' 添加链接）
 * @returns 是否允许继续操作
 */
export function handleUrlSecurityCheck(url: string, actionType: 'open' | 'add' = 'open'): boolean {
  const validation = validateUrl(url);

  // 安全的 URL，直接允许
  if (validation.valid) {
    return true;
  }

  const actionText = actionType === 'open' ? 'open' : 'add';

  // 绝对危险的协议 - 直接阻止，不允许绕过
  if (validation.reason === 'dangerous') {
    alert(
      `⚠️ Dangerous Link Blocked!\n\n` +
      `This link contains executable code (${validation.protocol}), which may steal your data or harm your device.\n\n` +
      `We have blocked this action to protect your security.`
    );
    console.error(`Blocked dangerous ${validation.protocol} URL:`, url);
    return false;
  }

  // 其他有风险的协议 - 警告并让用户选择
  const confirmed = confirm(
    `⚡ Unsafe Link Warning\n\n` +
    `This link uses the "${validation.protocol}" protocol, which may pose security risks.\n\n` +
    `Are you sure you want to ${actionText} this link?`
  );

  if (!confirmed) {
    console.log(`User cancelled ${validation.protocol} URL:`, url);
    return false;
  }

  // 用户确认强制操作
  console.warn(`User forced ${validation.protocol} URL:`, url);
  return true;
}
