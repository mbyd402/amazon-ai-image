// Netlify强制清理脚本
// 这个脚本会删除所有可能影响Netlify构建的文件

const fs = require('fs');
const path = require('path');

console.log('🧹 开始清理Netlify配置...');

const filesToDelete = [
  'netlify.toml',
  'netlify-build.sh',
  '.next',
  'node_modules/.cache',
  'package-lock.json',
  'yarn.lock'
];

filesToDelete.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      if (fs.lstatSync(file).isDirectory()) {
        fs.rmSync(file, { recursive: true, force: true });
        console.log(`✅ 删除目录: ${file}`);
      } else {
        fs.unlinkSync(file);
        console.log(`✅ 删除文件: ${file}`);
      }
    } else {
      console.log(`ℹ️ 文件不存在: ${file}`);
    }
  } catch (error) {
    console.log(`⚠️ 删除失败 ${file}: ${error.message}`);
  }
});

// 创建最简单的package.json备份
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// 简化脚本
packageJson.scripts = {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
};

// 写入简化版本
fs.writeFileSync('package-simple.json', JSON.stringify(packageJson, null, 2));
console.log('✅ 创建简化package.json: package-simple.json');

// 创建干净的README
const cleanReadme = `# Amazon AI Image Tools - Clean Version

## 🎯 项目状态
- ✅ 静态HTML版本: 100%可用
- ⚠️ Next.js构建: 需要修复

## 🔗 立即访问
1. **主门户**: / (直接访问所有静态版本)
2. **静态登录**: /static-login.html
3. **静态Dashboard**: /static-dashboard.html
4. **调试版本**: /debug-dashboard

## 🛠️ 构建修复
如果Netlify构建失败:
1. 删除所有构建命令
2. 清空环境变量
3. 使用静态版本

## 📞 支持
联系开发者获取帮助。
`;

fs.writeFileSync('README-CLEAN.md', cleanReadme);
console.log('✅ 创建清理说明: README-CLEAN.md');

console.log('🎉 清理完成！');
console.log('📋 下一步:');
console.log('1. git add .');
console.log('2. git commit -m "clean: remove all Netlify configs"');
console.log('3. git push origin main');
console.log('4. 在Netlify控制台清空构建命令');