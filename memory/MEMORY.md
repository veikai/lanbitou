# Lanbitou 任务紧急程度管理系统 - 开发记忆

## 项目概述
- 原项目是纯Flask后端API，提供任务CRUD功能
- 用户需求：添加前端，显示直角坐标系，横轴紧急程度，纵轴重要程度
- 紧急程度使用deadline距离当前天数计算，重要程度使用priority字段（1-5）

## 架构决策
1. **前端技术栈**：使用原生HTML/CSS/JavaScript + Canvas绘图，避免引入复杂框架
2. **数据模型扩展**：在Task模型中添加priority字段（整数1-5，默认3）
3. **坐标计算**：
   - 横轴（紧急程度）：deadline距离当前天数，范围[-30, 30]
   - 纵轴（重要程度）：priority值，范围[1, 5]，5最重要，1最不重要
4. **前端路由**：在Flask app.py中添加三个页面路由：坐标图、任务列表、添加任务
5. **事件处理**：Canvas使用事件委托，避免重复绑定

## 关键文件
- `lanbitou/db/models.py` - 添加priority字段
- `lanbitou/schemas.py` - 更新Pydantic schemas支持priority
- `lanbitou/app.py` - 添加前端路由
- `templates/` - HTML模板
- `static/` - CSS和JavaScript文件

## 遇到的问题与解决
1. **数据库迁移**：项目无迁移工具，直接修改模型后使用`flask init-db`重建表
2. **事件重复绑定**：drawTasks中每次绘制都添加新事件监听器，改为全局事件委托
3. **日期计算**：使用Math.floor代替Math.ceil确保过去日期为负值
4. **时区处理**：使用UTC时间避免时区问题
5. **坐标轴显示不全**：增加Canvas高度（550px），调整边距（bottom: 80），确保所有刻度和标签可见
6. **纵轴标签文字倒置**：移除`transform: rotate(180deg)`，保留`writing-mode: vertical-rl`正确显示垂直文本
7. **图形尺寸动态更新**：将graphWidth/graphHeight改为let变量，在resizeCanvas中重新计算

## 优先级方向调整
- 用户要求重要性从1到5依次递增，即5最重要，1最不重要
- 修改内容：
  1. 坐标图纵轴反转：优先级5在顶部（红色），1在底部（蓝色）
  2. 颜色映射反转：priorityColors[5] = 红色，priorityColors[1] = 蓝色
  3. 任务列表优先级徽章颜色调整
  4. 所有UI文本更新：5（最高），1（最低）
  5. 坐标轴标签和刻度调整
- 同时修复纵轴坐标显示不全问题：增加左边距，调整标签对齐方式

## 待改进项
1. API添加priority过滤支持
2. 坐标图添加图例和更多交互
3. 任务编辑功能整合到坐标图
4. 响应式设计优化
5. 添加任务状态（完成/未完成）

## 技术细节
- 紧急程度计算：`Math.floor((deadline - now) / (1000*60*60*24))`
- 坐标映射：线性插值到Canvas坐标
- 颜色编码：优先级5（红）最重要，到1（蓝）最不重要
- 事件委托：存储任务点坐标数组，在canvas事件中遍历检查

## 启动方式
```bash
cd /path/to/lanbitou
uv sync  # 安装依赖
uv run flask --app lanbitou.app init-db  # 初始化数据库
uv run flask --app lanbitou.app run --debug  # 启动开发服务器
```
访问 http://localhost:5000/ 查看坐标图