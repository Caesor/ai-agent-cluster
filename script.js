// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
    // 模拟加载
    setTimeout(() => {
    document.querySelector(".loader").style.opacity = 0;
        setTimeout(() => {
      document.querySelector(".loader").style.display = "none";
        }, 500);
  }, 1500);
    
    // 初始化3D场景
    initScene();
    
    // 绑定UI交互事件
    bindUIEvents();
});

// 全局变量
let scene, camera, renderer, controls;
let agentGroup,
  agents = [];
let currentAgentId = null;
let raycaster, mouse;
let tooltip = document.getElementById("agent-tooltip");
let particleEffects = [];
let isInitialLoad = true;

// 各层使用不同的配色方案
const layerColors = {
  inner: {
    base: "#1E4377", // 更深的蓝色
    variants: ["#1E4377", "#1C3E6F", "#224A80", "#254D88", "#1F457C"],
  },
  middle: {
    base: "#3A5745", // 改为偏绿色调
    variants: ["#3A5745", "#3F5D4A", "#365240", "#426350", "#3D5A48"],
  },
  outer: {
    base: "#614C66",
    variants: ["#614C66", "#67526C", "#6D5873", "#634E68", "#6A5570"],
  },
};

// 修改Agent数据分布，缩小环的大小但保持图标大小不变
const agentData = [
  // 第一层（最内层）：交易服务 - 内层已经是均匀分布
  {
    id: 1,
    name: "ARM服务",
    category: "inner",
    layer: 1,
    position: [0, 0, 1.2],
    color: layerColors.inner.variants[0],
    skills: ["资产管理", "权益配置", "区块链", "金融科技"],
    description:
      "提供区块链资产配置权益管理服务，帮助用户实现资产权益的精确配置和管理。",
  },
  {
    id: 2,
    name: "发行服务",
    category: "inner",
    layer: 1,
    position: [1.039, 0, 0.6],
    color: layerColors.inner.variants[1],
    skills: ["资产发行", "上市咨询", "流程管理", "合规服务"],
    description:
      "专注于数字资产发行全流程服务，为企业和机构提供一站式发行解决方案。",
  },
  {
    id: 3,
    name: "认购服务",
    category: "inner",
    layer: 1,
    position: [1.039, 0, -0.6],
    color: layerColors.inner.variants[2],
    skills: ["认购管理", "投资流程", "资金对接", "智能合约"],
    description: "提供数字资产认购流程管理，优化投资者认购体验，确保合规高效。",
  },
  {
    id: 4,
    name: "结算服务",
    category: "inner",
    layer: 1,
    position: [0, 0, -1.2],
    color: layerColors.inner.variants[3],
    skills: ["资金结算", "交易清算", "实时处理", "安全保障"],
    description: "实现资产交易的实时结算服务，保证资金流转安全与交易效率。",
  },
  {
    id: 5,
    name: "托管服务",
    category: "inner",
    layer: 1,
    position: [-1.039, 0, -0.6],
    color: layerColors.inner.variants[4],
    skills: ["资产托管", "数字保管", "安全协议", "多签验证"],
    description: "提供安全可靠的数字资产托管解决方案，满足机构级别的安全需求。",
  },
  {
    id: 6,
    name: "市场参与者",
    category: "inner",
    layer: 1,
    position: [-1.039, 0, 0.6],
    color: layerColors.inner.variants[0],
    skills: ["生态协作", "市场对接", "参与者管理", "多方协调"],
    description: "连接各类市场参与者，促进生态系统内的高效协作和交互。",
  },

  // 第二层（中间层）：专业支持 - 调整为均匀分布的11个Agent
  {
    id: 7,
    name: "产品",
    category: "middle",
    layer: 2,
    position: [0, 0, 2.4], // 顶部
    color: layerColors.middle.variants[0],
    skills: ["产品设计", "需求分析", "金融创新", "产品优化"],
    description: "基于市场趋势与用户需求，设计创新且合规的金融产品和服务模式。",
  },
  {
    id: 8,
    name: "风控",
    category: "middle",
    layer: 2,
    position: [1.428, 0, 1.931], // 顺时针分布1
    color: layerColors.middle.variants[1],
    skills: ["风险评估", "安全监控", "合规管理", "风险缓解"],
    description: "建立健全的风险控制体系，确保资产安全和业务合规运营。",
  },
  {
    id: 9,
    name: "评级",
    category: "middle",
    layer: 2,
    position: [2.262, 0, 0.824], // 顺时针分布2
    color: layerColors.middle.variants[2],
    skills: ["资产评级", "风险分析", "投资评估", "数据建模"],
    description: "基于多维度数据分析，提供客观公正的项目和资产评级服务。",
  },
  {
    id: 10,
    name: "估值",
    category: "middle",
    layer: 2,
    position: [2.4, 0, -0.415], // 右侧
    color: layerColors.middle.variants[3],
    skills: ["资产估值", "价格发现", "估值模型", "市场分析"],
    description: "采用专业估值方法和市场数据，提供精确可靠的资产估值服务。",
  },
  {
    id: 11,
    name: "税务",
    category: "middle",
    layer: 2,
    position: [1.766, 0, -1.624], // 顺时针分布4
    color: layerColors.middle.variants[4],
    skills: ["税务规划", "跨境税务", "合规申报", "政策分析"],
    description: "提供全面的税务解决方案，优化税务结构，确保合规运营。",
  },
  {
    id: 12,
    name: "跨境通道",
    category: "middle",
    layer: 2,
    position: [0.733, 0, -2.287], // 顺时针分布5
    color: layerColors.middle.variants[0],
    skills: ["跨境投资", "通道搭建", "法规对接", "资金流转"],
    description: "搭建安全合规的跨境投资通道，实现资产的全球化配置。",
  },
  {
    id: 13,
    name: "会计",
    category: "middle",
    layer: 2,
    position: [-0.733, 0, -2.287], // 底部偏左
    color: layerColors.middle.variants[1],
    skills: ["财务会计", "审计服务", "报表编制", "财务规划"],
    description: "提供专业会计服务，确保财务透明性与合规性，支持决策制定。",
  },
  {
    id: 14,
    name: "争议及解决",
    category: "middle",
    layer: 2,
    position: [-1.766, 0, -1.624], // 顺时针分布7
    color: layerColors.middle.variants[2],
    skills: ["纠纷调解", "仲裁支持", "诉讼协助", "和解方案"],
    description: "提供高效的争议解决方案，包括调解、仲裁和司法诉讼支持。",
  },
  {
    id: 15,
    name: "RBC法律安排",
    category: "middle",
    layer: 2,
    position: [-2.4, 0, -0.415], // 左侧
    color: layerColors.middle.variants[3],
    skills: ["法律架构", "合规设计", "权益保障", "风险管控"],
    description: "专注于RBC（基于风险的资本）的法律架构设计，确保合法合规。",
  },
  {
    id: 16,
    name: "交易所法律地位",
    category: "middle",
    layer: 2,
    position: [-2.262, 0, 0.824], // 顺时针分布9
    color: layerColors.middle.variants[4],
    skills: ["法律地位", "规则制定", "合规监管", "市场秩序"],
    description: "明确交易所的法律地位，制定规则框架，保障市场公平有序运行。",
  },
  {
    id: 17,
    name: "投资产品法律",
    category: "middle",
    layer: 2,
    position: [-1.428, 0, 1.931], // 顺时针分布10
    color: layerColors.middle.variants[0],
    skills: ["产品法律", "合同设计", "合规审查", "风险防控"],
    description: "为投资产品提供完善的法律架构设计，确保产品设计与运作合法合规。",
  },

  // 第三层（最外层）：增值服务 - 使用偏移角度确保完全均匀分布且避免首尾重叠
  {
    id: 19,
    name: "最新资讯",
    category: "outer",
    layer: 3,
    position: [3.520, 0, 0.747], // 12度位置
    color: layerColors.outer.variants[0],
    skills: ["行业动态", "政策解读", "市场分析", "趋势预测"],
    description: "实时追踪行业动态，提供高价值资讯和深度分析报告。",
  },
  {
    id: 20,
    name: "21章项目",
    category: "outer",
    layer: 3,
    position: [2.913, 0, 2.131], // 36度位置
    color: layerColors.outer.variants[1],
    skills: ["21章项目", "咨询服务", "资源对接", "合规指导"],
    description: "专注于21章项目的咨询和服务，帮助企业高效合规地获取资源。",
  },
  {
    id: 21,
    name: "创始人对话",
    category: "outer",
    layer: 3,
    position: [1.800, 0, 3.118], // 60度位置
    color: layerColors.outer.variants[2],
    skills: ["团队沟通", "创始人对接", "项目评估", "愿景解读"],
    description:
      "提供与投资项目创始人直接对话的渠道，深入了解项目愿景和团队能力。",
  },
  {
    id: 22,
    name: "投前决策参考",
    category: "outer",
    layer: 3,
    position: [0.377, 0, 3.582], // 84度位置
    color: layerColors.outer.variants[3],
    skills: ["决策分析", "投资评估", "风险筛查", "机会识别"],
    description:
      "为投资决策提供全方位的参考依据，帮助投资者做出明智的投前决策。",
  },
  {
    id: 32,
    name: "文娱行业",
    category: "outer",
    layer: 3,
    position: [-1.114, 0, 3.425], // 108度位置
    color: layerColors.outer.variants[4],
    skills: ["数字内容", "IP开发", "用户运营", "泛娱乐生态"],
    description: "研究文化娱乐产业创新与发展，涵盖影视、游戏、音乐、直播等领域。",
  },
  {
    id: 33,
    name: "零售行业",
    category: "outer",
    layer: 3,
    position: [-2.426, 0, 2.715], // 132度位置
    color: layerColors.outer.variants[0],
    skills: ["零售创新", "消费升级", "供应链优化", "品牌策略"],
    description: "聚焦零售行业转型与创新，分析新零售模式、消费者行为和市场趋势。",
  },
  {
    id: 23,
    name: "收入分成ABC",
    category: "outer",
    layer: 3,
    position: [-3.307, 0, 1.453], // 156度位置
    color: layerColors.outer.variants[1],
    skills: ["利益分配", "智能合约", "收益管理", "透明机制"],
    description: "基于智能合约设计收入分成机制，实现自动化、透明化的利益分配。",
  },
  {
    id: 24,
    name: "RWA",
    category: "outer",
    layer: 3,
    position: [-3.600, 0, 0], // 180度位置
    color: layerColors.outer.variants[2],
    skills: ["实物资产", "资产数字化", "流动性增强", "价值评估"],
    description: "专注于实物资产(Real World Assets)的数字化与区块链应用，提升资产流动性。",
  },
  {
    id: 25,
    name: "投后管理参考",
    category: "outer",
    layer: 3,
    position: [-3.307, 0, -1.453], // 204度位置
    color: layerColors.outer.variants[3],
    skills: ["绩效跟踪", "风险监控", "价值提升", "战略规划"],
    description: "提供投后管理最佳实践参考，帮助投资者有效管理投资组合并提升价值。",
  },
  {
    id: 31,
    name: "电商行业",
    category: "outer",
    layer: 3,
    position: [-2.426, 0, -2.715], // 228度位置
    color: layerColors.outer.variants[4],
    skills: ["电商平台", "全渠道零售", "直播带货", "跨境电商"],
    description: "分析电子商务发展趋势和创新模式，提供全面的行业洞察和投资建议。",
  },
  {
    id: 26,
    name: "中国大消费投资案例库",
    category: "outer",
    layer: 3,
    position: [-1.114, 0, -3.425], // 252度位置
    color: layerColors.outer.variants[0],
    skills: ["消费市场", "行业洞察", "投资机会", "趋势研究"],
    description: "专注于中国大消费领域的投资研究，提供市场洞察和投资案例分析。",
  },
  {
    id: 28,
    name: "能源行业",
    category: "outer",
    layer: 3,
    position: [0.377, 0, -3.582], // 276度位置
    color: layerColors.outer.variants[1],
    skills: ["新能源", "传统能源", "能源转型", "行业趋势"],
    description: "专注能源行业研究，覆盖传统能源、新能源及能源转型策略分析。",
  },
  {
    id: 30,
    name: "餐饮行业",
    category: "outer",
    layer: 3,
    position: [1.800, 0, -3.118], // 300度位置
    color: layerColors.outer.variants[2],
    skills: ["餐饮模式", "连锁经营", "数字化转型", "消费趋势"],
    description: "深度研究餐饮市场发展趋势，分析创新商业模式和消费行为变化。",
  },
  {
    id: 34,
    name: "服务行业",
    category: "outer",
    layer: 3,
    position: [2.913, 0, -2.131], // 324度位置
    color: layerColors.outer.variants[3],
    skills: ["服务设计", "体验经济", "价值创新", "服务标准"],
    description: "专注于现代服务业研究，探索服务创新、体验经济和数字化转型策略。",
  },
  {
    id: 29,
    name: "文旅行业",
    category: "outer",
    layer: 3,
    position: [3.520, 0, -0.747], // 348度位置
    color: layerColors.outer.variants[4],
    skills: ["旅游资源", "文化产业", "体验经济", "场景营销"],
    description: "聚焦文化旅游产业发展，探索 文化+旅游 融合创新模式与投资机会。",
  },
];

// 初始化3D场景
function initScene() {
    // 创建场景
    scene = new THREE.Scene();
    
    // 设置深空背景 - 添加渐变效果
    const spaceColors = [
        new THREE.Color(0x000520), // 深蓝底色
        new THREE.Color(0x05051E), // 深紫蓝
        new THREE.Color(0x100010)  // 深紫黑
    ];
    
    // 创建背景渐变
    const bgTexture = createGradientTexture(spaceColors);
    scene.background = bgTexture;
    
  // 创建相机 - 完全固定俯瞰视角
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 12.5, 0); // 放大1.2倍，原来是15，现在是12.5
  camera.lookAt(0, 0, 0);
    
    // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
    renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制像素比，提高性能
  document.getElementById("scene-container").appendChild(renderer.domElement);
    
  // 创建控制器 - 完全禁止旋转和缩放
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0; // 禁止旋转
    controls.enableRotate = false; // 完全禁止旋转
    controls.enableZoom = false; // 完全禁止缩放

    // 固定视角在顶部
    controls.minPolarAngle = 0; // 固定为俯视视角
    controls.maxPolarAngle = 0;
    
    // 创建光源
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 10, 1);
    scene.add(directionalLight);
    
    // 创建Agent群组
    agentGroup = new THREE.Group();
    scene.add(agentGroup);
    
    // 添加星空背景
    createStarfield();
    
    // 添加额外的星域效果
    addCelestialEffects();
    
  // 创建三层椭圆结构
  createThreeLayerStructure();
    
    // 创建Agent图标
    createAgentIcons();
    
    // 初始化交互
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // 动画循环
    animate();
    
    // 窗口调整大小处理
  window.addEventListener("resize", onWindowResize);

  // 点击和鼠标移动事件
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("click", onMouseClick);

  // 禁用滚轮事件以防止任何可能的缩放
  document.addEventListener("wheel", function(event) {
    event.preventDefault();
  }, { passive: false });

  // 启动动画效果
  setTimeout(() => {
    isInitialLoad = false;
  }, 2000);
}

// 创建渐变纹理函数
function createGradientTexture(colors) {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const context = canvas.getContext('2d');
    
    // 创建径向渐变
    const gradient = context.createRadialGradient(
        size / 2, size / 2, 0,    // 内圆中心点和半径
        size / 2, size / 2, size / 2  // 外圆中心点和半径
    );
    
    // 添加渐变颜色点
    gradient.addColorStop(0, '#' + colors[0].getHexString());
    gradient.addColorStop(0.5, '#' + colors[1].getHexString());
    gradient.addColorStop(1, '#' + colors[2].getHexString());
    
    // 填充渐变
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    
    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// 创建星空背景 - 更丰富的星空效果
function createStarfield() {
    // 创建基础星空背景
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.07,
        transparent: true,
        opacity: 0.7,
    });
    
    const starsVertices = [];
    for (let i = 0; i < 8000; i++) { // 增加星星数量
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(starsVertices, 3)
    );
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // 添加不同颜色和大小的星星层次感
    const createStarLayer = (count, size, color, opacityBase, spread) => {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.PointsMaterial({
            color: color,
            size: size,
            transparent: true,
            opacity: opacityBase,
        });
    
        const vertices = [];
        // 添加闪烁参数
        const twinkling = [];
        const twinkleSpeed = [];
        
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * spread;
            const y = (Math.random() - 0.5) * spread;
            const z = (Math.random() - 0.5) * spread;
            vertices.push(x, y, z);
            
            // 为每颗星星添加随机闪烁参数
            twinkling.push(Math.random() * Math.PI * 2); // 随机初始相位
            twinkleSpeed.push(0.01 + Math.random() * 0.05); // 随机闪烁速度
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const points = new THREE.Points(geometry, material);
        
        // 保存闪烁参数到userData中
        points.userData = {
            baseOpacity: opacityBase,
            twinkling: twinkling,
            twinkleSpeed: twinkleSpeed,
            originalSize: size
        };
        
        scene.add(points);
        
        // 添加到星星效果数组中用于动画更新
        if (!window.starLayers) window.starLayers = [];
        window.starLayers.push(points);
        
        return points;
    };
    
    // 创建蓝色星群
    createStarLayer(300, 0.12, 0x4A7CFF, 0.9, 500);
    
    // 创建金色星群
    createStarLayer(200, 0.09, 0xFFD27D, 0.85, 400);
    
    // 创建红色星群
    createStarLayer(150, 0.10, 0xFF6B5E, 0.8, 450);
    
    // 创建远处暗星
    createStarLayer(1500, 0.03, 0xCCCCFF, 0.6, 1800);
    
    // 添加明亮闪烁星星
    createStarLayer(50, 0.15, 0xFFFFFF, 0.95, 600); // 白色亮星
    createStarLayer(30, 0.16, 0xB3E5FC, 0.92, 550); // 淡蓝色亮星
    createStarLayer(20, 0.17, 0xFFECB3, 0.93, 450); // 金黄色亮星
            
    // 创建星云效果
    const createNebula = (color, size, position, opacity) => {
        // 创建星云粒子
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        // 在椭球体空间内生成粒子
        for (let i = 0; i < particleCount; i++) {
            // 球坐标系生成点
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = (0.3 + Math.random() * 0.7) * size; // 中心密度更高
            
            // 转换为笛卡尔坐标
            positions[i * 3] = position.x + r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = position.y + r * Math.sin(phi) * Math.sin(theta) * 0.6;
            positions[i * 3 + 2] = position.z + r * Math.cos(phi);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.8,
        transparent: true,
            opacity: opacity,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
    });
    
        const nebula = new THREE.Points(geometry, material);
        scene.add(nebula);
    
        // 让星云缓慢旋转
        nebula.userData = {
            rotateSpeed: Math.random() * 0.0002 + 0.0001,
            originalPositions: positions.slice(),
            time: 0
        };
    
        // 添加到动画对象中
        if (!window.nebulaEffects) window.nebulaEffects = [];
        window.nebulaEffects.push(nebula);
        
        return nebula;
    };
    
    // 添加几个不同颜色的星云
    createNebula(0x3B68FF, 120, {x: -180, y: -100, z: -300}, 0.4); // 蓝色星云
    createNebula(0xFF4C7A, 150, {x: 250, y: -30, z: -200}, 0.3);  // 粉红星云
    createNebula(0x22EAAA, 100, {x: -100, y: 50, z: -350}, 0.35); // 绿松石星云
    createNebula(0x9B6EFF, 180, {x: 300, y: -80, z: -250}, 0.25); // 紫色星云
    
    // 创建发光中心 - 远处恒星
    const createDistantStar = (color, size, position, intensity) => {
        const starGeometry = new THREE.SphereGeometry(size, 16, 16);
        const starMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(position.x, position.y, position.z);
        scene.add(star);
        
        // 添加发光效果
        const glow = new THREE.PointLight(color, intensity, 150);
        glow.position.set(position.x, position.y, position.z);
        scene.add(glow);
        
        return {star, glow};
    };
    
    // 添加远处的恒星
    createDistantStar(0xFFBB77, 2, {x: -300, y: -100, z: -700}, 0.8);
    createDistantStar(0x88DDFF, 1.5, {x: 400, y: 50, z: -600}, 0.6);
    
    // 添加闪烁亮星效果
    const createTwinklingStar = (color, size, position, intensity) => {
        // 创建星星核心
        const starGeometry = new THREE.SphereGeometry(size * 0.3, 8, 8);
        const starMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9
        });
        
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(position.x, position.y, position.z);
        scene.add(star);
        
        // 创建光晕效果
        const glowGeometry = new THREE.SphereGeometry(size, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(position.x, position.y, position.z);
        scene.add(glow);
        
        // 添加光线效果
        const light = new THREE.PointLight(color, intensity, 30);
        light.position.set(position.x, position.y, position.z);
        scene.add(light);
        
        // 添加十字形光线
        const spikeMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        // 水平光线
        const spikeHGeometry = new THREE.BoxGeometry(size * 5, size * 0.15, size * 0.15);
        const spikeH = new THREE.Mesh(spikeHGeometry, spikeMaterial);
        spikeH.position.set(position.x, position.y, position.z);
        scene.add(spikeH);
        
        // 垂直光线
        const spikeVGeometry = new THREE.BoxGeometry(size * 0.15, size * 5, size * 0.15);
        const spikeV = new THREE.Mesh(spikeVGeometry, spikeMaterial);
        spikeV.position.set(position.x, position.y, position.z);
        scene.add(spikeV);
        
        // 记录闪烁效果所需数据
        const twinklingStar = {
            star: star,
            glow: glow,
            light: light,
            spikeH: spikeH,
            spikeV: spikeV,
            time: Math.random() * Math.PI * 2,
            speed: 0.03 + Math.random() * 0.02,
            baseSize: size,
            baseIntensity: intensity
        };
        
        // 添加到动画对象中
        if (!window.twinklingStars) window.twinklingStars = [];
        window.twinklingStars.push(twinklingStar);
        
        return twinklingStar;
    };
    
    // 添加几个明显闪烁的亮星
    createTwinklingStar(0xFFFFFF, 1.2, {x: -120, y: 70, z: -400}, 0.7); // 白色亮星
    createTwinklingStar(0x66CCFF, 0.9, {x: 150, y: -40, z: -350}, 0.5); // 蓝色亮星
    createTwinklingStar(0xFFDA84, 1.0, {x: 80, y: 90, z: -450}, 0.6);  // 金色亮星
    createTwinklingStar(0xFFB6C1, 0.8, {x: -200, y: -60, z: -300}, 0.4); // 粉色亮星
    }
    
// 创建三层椭圆结构 - 调整半径使圆环紧密相连
function createThreeLayerStructure() {
  // 圆环宽度常量
  const ringWidth = 1.2;
  
  // 内层：交易服务 - 半径从内向外计算
  const innerLayerRadius = 1.2;
  createEllipseLayer(innerLayerRadius, innerLayerRadius, layerColors.inner.base, 1, ringWidth);
  
  // 中层：专业支持 - 紧接着内层的外边缘
  const middleLayerRadius = innerLayerRadius + ringWidth;
  createEllipseLayer(middleLayerRadius, middleLayerRadius, layerColors.middle.base, 2, ringWidth);
  
  // 外层：增值服务 - 紧接着中层的外边缘
  const outerLayerRadius = middleLayerRadius + ringWidth;
  createEllipseLayer(outerLayerRadius, outerLayerRadius, layerColors.outer.base, 3, ringWidth);
}

// 创建单层椭圆形结构 - 更精细的椭圆结构
function createEllipseLayer(radiusX, radiusY, color, layer, ringWidth) {
  // 为不同层级设置不同的不透明度
  let ringOpacity, thinRingOpacity;
  
  if (layer === 1) { // 内层 - 蓝色
    ringOpacity = 0.25;
    thinRingOpacity = 0.30;
  } else if (layer === 2) { // 中层 - 绿色
    ringOpacity = 0.23;
    thinRingOpacity = 0.28;
  } else { // 外层 - 紫色
    ringOpacity = 0.21;
    thinRingOpacity = 0.25;
  }

  // 计算环形几何体的内外半径
  const ringGeometry = new THREE.RingGeometry(
    radiusX - ringWidth/2, // 内半径
    radiusX + ringWidth/2, // 外半径
    80, // 圆周分段数
    1 // 径向分段数
  );

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: ringOpacity, // 使用针对当前层的不透明度
    side: THREE.DoubleSide,
  });

  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2; // 旋转至水平面
  ring.position.y = 0.01 * layer; // 轻微垂直分隔
  ring.userData = {
    layer: layer,
    type: "ellipse",
    baseOpacity: ringOpacity,
  };
  agentGroup.add(ring);
    
  // 只在整个环形系统的最内侧和最外侧添加辅助环线
  if (layer === 1) {
    // 内层添加内侧环线
    const innerThinRingGeometry = new THREE.RingGeometry(
      radiusX - ringWidth/2 - 0.05, // 内细环
      radiusX - ringWidth/2 - 0.02,
      80,
      1
    );

    const thinRingMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: thinRingOpacity,
      side: THREE.DoubleSide,
    });

    const innerThinRing = new THREE.Mesh(innerThinRingGeometry, thinRingMaterial);
    innerThinRing.rotation.x = Math.PI / 2;
    innerThinRing.position.y = 0.015 * layer;
    innerThinRing.userData = {
      layer: layer,
      type: "ellipse",
      baseOpacity: thinRingOpacity,
    };
    agentGroup.add(innerThinRing);
  } else if (layer === 3) {
    // 外层添加外侧环线
    const outerThinRingGeometry = new THREE.RingGeometry(
      radiusX + ringWidth/2 + 0.02, // 外细环
      radiusX + ringWidth/2 + 0.05,
      80,
      1
    );

    const thinRingMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: thinRingOpacity,
      side: THREE.DoubleSide,
    });

    const outerThinRing = new THREE.Mesh(outerThinRingGeometry, thinRingMaterial);
    outerThinRing.rotation.x = Math.PI / 2;
    outerThinRing.position.y = 0.015 * layer;
    outerThinRing.userData = {
      layer: layer,
      type: "ellipse",
      baseOpacity: thinRingOpacity,
    };
    agentGroup.add(outerThinRing);
  }

  // 在环与环的接缝处添加连接线，增强衔接效果
  if (layer === 2) {
    // 中层与内层的接缝
    const innerSeamGeometry = new THREE.RingGeometry(
      radiusX - ringWidth/2 - 0.01, // 接缝位置
      radiusX - ringWidth/2 + 0.01,
      80,
      1
    );
    
    // 混合两层颜色
    const innerSeamColor = new THREE.Color(layerColors.inner.base)
      .lerp(new THREE.Color(layerColors.middle.base), 0.5);
    
    const innerSeamMaterial = new THREE.MeshBasicMaterial({
      color: innerSeamColor,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    
    const innerSeam = new THREE.Mesh(innerSeamGeometry, innerSeamMaterial);
    innerSeam.rotation.x = Math.PI / 2;
    innerSeam.position.y = 0.013; // 稍微位于两层之间
    innerSeam.userData = {
      type: "seam",
      baseOpacity: 0.3,
    };
    agentGroup.add(innerSeam);
  } else if (layer === 3) {
    // 外层与中层的接缝
    const outerSeamGeometry = new THREE.RingGeometry(
      radiusX - ringWidth/2 - 0.01, // 接缝位置
      radiusX - ringWidth/2 + 0.01,
      80,
      1
    );
    
    // 混合两层颜色
    const outerSeamColor = new THREE.Color(layerColors.middle.base)
      .lerp(new THREE.Color(layerColors.outer.base), 0.5);
    
    const outerSeamMaterial = new THREE.MeshBasicMaterial({
      color: outerSeamColor,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    
    const outerSeam = new THREE.Mesh(outerSeamGeometry, outerSeamMaterial);
    outerSeam.rotation.x = Math.PI / 2;
    outerSeam.position.y = 0.023; // 稍微位于两层之间
    outerSeam.userData = {
      type: "seam",
      baseOpacity: 0.3,
    };
    agentGroup.add(outerSeam);
  }

  // 添加动态粒子效果
  addParticlesEffect(radiusX, radiusY, color, layer);
}

// 添加动态粒子效果 - 改进粒子效果，使其更流畅和密集
function addParticlesEffect(radiusX, radiusY, color, layer) {
  // 根据层级调整粒子数量
  const particlesCount = 75 + layer * 15; // 层级越高，粒子越多
  
  // 根据层级调整粒子大小
  const particleSize = 0.04 + layer * 0.005;
  
  const particlesMaterial = new THREE.PointsMaterial({
    color: color,
    size: particleSize,
    transparent: true,
    opacity: 0.7, // 降低不透明度，使效果更微妙
  });

  const particlesGeometry = new THREE.BufferGeometry();
  const particlesPositions = new Float32Array(particlesCount * 3);
  const particlesSpeeds = [];

  // 沿椭圆均匀分布粒子
  for (let i = 0; i < particlesCount; i++) {
    const angle = (i / particlesCount) * Math.PI * 2;
    const x = radiusX * Math.cos(angle);
    const z = radiusY * Math.sin(angle);

    particlesPositions[i * 3] = x;
    particlesPositions[i * 3 + 1] = 0.01 + layer * 0.01; // 调整高度，使层级感更强
    particlesPositions[i * 3 + 2] = z;

    // 根据层级和位置设置不同速度
    const variation = Math.random() * 0.002; // 增加随机变化
    particlesSpeeds.push(0.005 + (layer * 0.0005) - variation);
                }

  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlesPositions, 3)
  );
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  particles.userData = {
    type: "particles",
    radiusX: radiusX,
    radiusY: radiusY,
    speeds: particlesSpeeds,
    layer: layer,
  };
  agentGroup.add(particles);

  // 保存到粒子效果数组中
  particleEffects.push(particles);
}

// 修改创建Agent图标函数，移除所有经度线
function createAgentIcons() {
  agents = [];

  // 为每个Agent创建图标
  agentData.forEach((agent) => {
    // 根据层级调整图标大小
    const size = 0.2 + agent.layer * 0.018; // 从内到外层级逐渐增大
    
    // 创建基本几何体 - 圆球
    const geometry = new THREE.SphereGeometry(size, 32, 32);
        
    // 发光材质
    const material = new THREE.MeshStandardMaterial({
            color: agent.color,
            emissive: agent.color,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.8,
        });
        
    // 创建网格
    const sphere = new THREE.Mesh(geometry, material);
        
    // 设置位置
    sphere.position.set(
      agent.position[0],
      0.08 + agent.layer * 0.04, // 调整高度梯度，使层级感更强
      agent.position[2]
    );
        
    // 设置用户数据
    sphere.userData = {
            id: agent.id,
            name: agent.name,
            category: agent.category,
      layer: agent.layer,
      description: agent.description,
      originalPosition: [...agent.position],
      originalColor: agent.color,
      skills: agent.skills || [],
        };
        
    // 添加到场景
    agentGroup.add(sphere);

    // 保存到agents数组
    agents.push(sphere);

    // 计算标签位置 - 调整标签与图标的距离
    const labelDirection = new THREE.Vector3(
      agent.position[0],
      0,
      agent.position[2]
    ).normalize();
    
    // 根据层级调整标签距离
    const labelOffset = 0.3 + agent.layer * 0.025;
    
    const labelPos = {
      x: agent.position[0] + labelDirection.x * labelOffset,
      y: 0.3 + agent.layer * 0.04, // 调整标签高度
      z: agent.position[2] + labelDirection.z * labelOffset,
    };

    // 为Agent添加名称标签 - 永久显示
    const nameSprite = createTextSprite(agent.name, agent.color);
    nameSprite.position.set(labelPos.x, labelPos.y, labelPos.z);
    
    // 根据层级调整标签大小
    const labelScale = 1.5 + agent.layer * 0.08;
    nameSprite.scale.set(labelScale, labelScale * 0.25, 1);
    
    nameSprite.userData = {
      agentId: agent.id,
      type: "label",
    };
    nameSprite.visible = true; // 始终显示标签
    agentGroup.add(nameSprite);
  });

  // 初始显示全部Agent
  filterAgentsByCategory("all");
}

// 创建文本精灵 - 优化文本标签效果，增强可见度
function createTextSprite(text, color) {
  // 创建Canvas
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // 设置Canvas大小，减小高度使文本更紧凑
  canvas.width = 256;
  canvas.height = 48; // 减小高度

  // 填充透明背景
  context.fillStyle = "rgba(0,0,0,0)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 设置文本样式 - 减小字体大小使其更紧凑
  context.font = "bold 22px Rajdhani";
  context.textAlign = "center";
  context.textBaseline = "middle";

  // 增强文本阴影效果 - 使用深色阴影增加对比度
  context.shadowColor = "rgba(0,0,0,0.95)"; // 增强阴影不透明度
  context.shadowBlur = 8;
  context.shadowOffsetX = 2;
  context.shadowOffsetY = 2;

  // 更强烈地增亮文本颜色
  const brightColor = brightenColor(color, 60); // 增加亮度

  // 绘制文本 - 使用更亮的颜色
  context.fillStyle = brightColor;
  context.fillText(text, canvas.width / 2, canvas.height / 2);
        
  // 创建纹理
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  // 创建材质
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
        
  // 创建精灵 - 使用更适合的尺寸
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(1.5, 0.4, 1); // 更紧凑的缩放比例

  return sprite;
}

// 颜色增亮函数 - 使颜色更亮
function brightenColor(hexColor, percent) {
  // 如果是带#的颜色，去掉#
  hexColor = hexColor.replace("#", "");

  // 解析RGB值
  let r = parseInt(hexColor.substr(0, 2), 16);
  let g = parseInt(hexColor.substr(2, 2), 16);
  let b = parseInt(hexColor.substr(4, 2), 16);

  // 增加RGB值
  r = Math.min(255, Math.floor((r * (100 + percent)) / 100));
  g = Math.min(255, Math.floor((g * (100 + percent)) / 100));
  b = Math.min(255, Math.floor((b * (100 + percent)) / 100));

  // 转回十六进制
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// 窗口调整大小处理
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // 确保相机位置不变
    camera.position.set(0, 12.5, 0);
    camera.lookAt(0, 0, 0);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
  // 更新动态效果
  updateDynamicEffects();

  renderer.render(scene, camera);
}

// 更新动态效果 - 优化动画效果，使其更流畅
function updateDynamicEffects() {
  // 旋转整个Agent群组 - 初始加载时有轻微旋转效果
  if (isInitialLoad) {
    agentGroup.rotation.y += 0.001;
  }

  // 更新粒子位置
  particleEffects.forEach((particles) => {
    const positions = particles.geometry.attributes.position.array;
    const speeds = particles.userData.speeds;
    const radiusX = particles.userData.radiusX;
    const radiusY = particles.userData.radiusY;

    for (let i = 0; i < positions.length / 3; i++) {
      // 计算当前角度
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];

      let angle = Math.atan2(z, x);

      // 更新角度
      angle += speeds[i];

      // 计算新位置
      positions[i * 3] = radiusX * Math.cos(angle);
      positions[i * 3 + 2] = radiusY * Math.sin(angle);
    }

    // 通知Three.js更新顶点
    particles.geometry.attributes.position.needsUpdate = true;
  });
  
  // 更新星星闪烁效果
  if (window.starLayers) {
    window.starLayers.forEach(starLayer => {
      const twinkling = starLayer.userData.twinkling;
      const twinkleSpeed = starLayer.userData.twinkleSpeed;
      const baseOpacity = starLayer.userData.baseOpacity;
      const originalSize = starLayer.userData.originalSize;
      
      // 更新每颗星星的闪烁相位
      for (let i = 0; i < twinkling.length; i++) {
        twinkling[i] += twinkleSpeed[i];
        
        // 周期性闪烁效果
        const twinkleFactor = 0.5 + 0.5 * Math.sin(twinkling[i]);
        
        // 计算新的大小和透明度 - 模拟闪烁
        const sizeFactor = 0.8 + 0.4 * twinkleFactor;
        
        // 如果是较亮的星星（更大），则闪烁更明显
        if (originalSize > 0.08) {
          // 使用颜色亮度调整来模拟闪烁
          const hsl = {};
          new THREE.Color(starLayer.material.color).getHSL(hsl);
          
          // 在保持色相和饱和度不变的情况下调整亮度
          const newL = Math.max(0.5, Math.min(1, hsl.l * (0.8 + 0.4 * twinkleFactor)));
          starLayer.material.color.setHSL(hsl.h, hsl.s, newL);
        }
      }
      
      // 整体星层的闪烁效果
      const time = Date.now() * 0.0005;
      const layerTwinkleFactor = 0.85 + 0.15 * Math.sin(time);
      starLayer.material.opacity = baseOpacity * layerTwinkleFactor;
      starLayer.material.size = originalSize * (0.9 + 0.2 * Math.sin(time * 0.7));
    });
  }
  
  // 更新星云效果
  if (window.nebulaEffects) {
    window.nebulaEffects.forEach(nebula => {
      nebula.userData.time += 0.01;
      nebula.rotation.y += nebula.userData.rotateSpeed;
      
      // 创建星云波动效果
      const positions = nebula.geometry.attributes.position.array;
      const originalPositions = nebula.userData.originalPositions;
      
      for (let i = 0; i < positions.length / 3; i++) {
        const idx = i * 3;
        const distance = Math.sqrt(
          originalPositions[idx] * originalPositions[idx] + 
          originalPositions[idx+1] * originalPositions[idx+1] + 
          originalPositions[idx+2] * originalPositions[idx+2]
        );
        
        // 波动因子
        const waveFactor = 0.08 * Math.sin(nebula.userData.time + distance * 0.01);
        
        positions[idx] = originalPositions[idx] * (1 + waveFactor);
        positions[idx+1] = originalPositions[idx+1] * (1 + waveFactor * 0.8);
        positions[idx+2] = originalPositions[idx+2] * (1 + waveFactor);
      }
      
      nebula.geometry.attributes.position.needsUpdate = true;
    });
  }
  
  // 更新闪烁亮星效果
  if (window.twinklingStars) {
    window.twinklingStars.forEach(star => {
      // 更新闪烁时间
      star.time += star.speed;
      
      // 计算闪烁因子 - 使用不规则的闪烁模式
      const mainTwinkle = 0.7 + 0.3 * Math.sin(star.time);
      const secondaryTwinkle = 0.85 + 0.15 * Math.sin(star.time * 2.7);
      const twinkleFactor = mainTwinkle * secondaryTwinkle;
      
      // 快速闪烁的微变化
      const microTwinkle = 0.95 + 0.05 * Math.sin(star.time * 10);
      
      // 应用到星星的各个组件
      
      // 核心亮度
      star.star.material.opacity = 0.7 + 0.3 * twinkleFactor;
      
      // 光晕大小和亮度
      const glowScale = star.baseSize * (0.8 + 0.4 * twinkleFactor);
      star.glow.scale.set(glowScale, glowScale, glowScale);
      star.glow.material.opacity = 0.3 + 0.3 * twinkleFactor * microTwinkle;
      
      // 光照强度
      star.light.intensity = star.baseIntensity * twinkleFactor * microTwinkle;
      
      // 光线闪烁
      star.spikeH.material.opacity = 0.3 + 0.5 * twinkleFactor * microTwinkle;
      star.spikeV.material.opacity = 0.3 + 0.5 * twinkleFactor * microTwinkle;
      
      // 随机旋转光线，增加动态效果
      star.spikeH.rotation.z += 0.001;
      star.spikeV.rotation.z += 0.001;
    });
  }
  
  // 更新星域光晕和星尘效果
  if (window.celestialEffects) {
    const time = Date.now() * 0.001;
    
    window.celestialEffects.forEach(effect => {
      if (effect.type === 'stardust') {
        // 更新星尘的时间参数
        effect.object.material.uniforms.time.value = time;
      }
      else if (effect.type === 'glow') {
        // 光晕呼吸效果
        effect.time += 0.01;
        const pulseFactor = Math.sin(effect.time * 0.2) * 0.1 + 1.0; // 0.9-1.1范围内呼吸
        
        // 应用到光晕大小和亮度
        effect.object.scale.set(pulseFactor, pulseFactor, pulseFactor);
        effect.core.scale.set(pulseFactor * 1.2, pulseFactor * 1.2, pulseFactor * 1.2);
        
        // 光强度闪烁
        const intensityFactor = Math.sin(effect.time * 0.3) * 0.2 + 0.8; // 0.6-1.0范围内闪烁
        effect.light.intensity = intensityFactor * 0.3;
      }
    });
  }

  // 更新椭圆脉动效果 - 为椭圆添加微妙的呼吸效果
  agentGroup.children.forEach((child) => {
    if (child.userData && child.userData.type === "ellipse") {
      const time = Date.now() * 0.001;
      const layer = child.userData.layer;
      const breathSpeed = 0.2 + layer * 0.1; // 不同层级有不同频率

      // 微妙的呼吸效果
      const breathAmount = 0.03 * Math.sin(time * breathSpeed);

      child.material.opacity = child.userData.baseOpacity + breathAmount;
    }
  });

  // 更新Agent位置 - 移除上下浮动效果，使Agent保持固定
  agents.forEach((agent) => {
    // 设置固定高度，根据层级不同
    agent.position.y = 0.08 + agent.userData.layer * 0.04;

    // 标签也保持固定高度
    agentGroup.children.forEach((child) => {
      if (
        child.userData.type === "label" &&
        child.userData.agentId === agent.userData.id
      ) {
        child.position.y = 0.3 + agent.userData.layer * 0.04;
      }
    });
  });
}

// 鼠标移动事件处理 - 改进鼠标悬停交互，名称标签已永久显示
function onMouseMove(event) {
  // 计算归一化的设备坐标
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
  // 更新射线
    raycaster.setFromCamera(mouse, camera);
    
  // 获取与Agent球体的交点
  const intersects = raycaster.intersectObjects(agents);
    
  // 重置所有Agent外观
  agents.forEach((agent) => {
    // 如果不是当前选中的Agent，恢复默认状态
    if (agent.userData.id !== currentAgentId) {
      agent.material.emissiveIntensity = 0.4;
    }
    });
    
  // 隐藏提示框
  tooltip.style.display = "none";
  tooltip.classList.remove("visible");

  // 如果有交点
    if (intersects.length > 0) {
    const agent = intersects[0].object;

    // 高亮显示悬停的Agent
    if (agent.userData.id !== currentAgentId) {
      // 只增强发光效果，不改变大小
      agent.material.emissiveIntensity = 0.7 + agent.userData.layer * 0.05;
    }

    // 显示提示框
    tooltip.style.display = "block";
    tooltip.textContent = agent.userData.name;

    // 计算提示框位置
    const vector = new THREE.Vector3();
    vector.copy(agent.position);
    vector.project(camera);

    tooltip.style.left =
      window.innerWidth / 2 + (vector.x * window.innerWidth) / 2 + "px";
    tooltip.style.top =
      window.innerHeight / 2 - (vector.y * window.innerHeight) / 2 + "px";

    // 添加显示动画
    setTimeout(() => {
      tooltip.classList.add("visible");
    }, 10);
  }
        }
        
// 获取层级名称
function getLayerName(layer) {
  switch (layer) {
    case 1:
      return "内层基础服务";
    case 2:
      return "中层专业支持";
    case 3:
      return "外层增值服务";
    default:
      return "未知层级";
    }
}

// 鼠标点击事件处理 - 改进点击交互和信息显示
function onMouseClick(event) {
    raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(agents);
    
    if (intersects.length > 0) {
    const agent = intersects[0].object;
    currentAgentId = agent.userData.id;
        
    // 高亮显示选中的Agent
    focusOnAgent(agent.position);

    // 直接打开聊天面板而不是信息面板
    const agentName = agent.userData.name;
    document.getElementById("chat-agent-name").textContent = agentName;
            
    // 显示聊天面板
    const chatPanel = document.querySelector(".chat-panel");
    chatPanel.style.display = "flex";
    setTimeout(() => {
      chatPanel.classList.add("visible");
      // 重新计算滚动区域
      scrollChatToBottom();
    }, 10);
            
    // 清空聊天记录
    const chatBody = document.querySelector(".chat-body");
    chatBody.innerHTML = "";
            
    // 开始模拟对话
    startSimulatedConversation(agentName);
  }
}

// 聚焦到特定Agent位置
function focusOnAgent(position) {
  // 只高亮显示选中的Agent，不进行相机移动或旋转
  agents.forEach((agent) => {
    if (agent.position.x === position.x && agent.position.z === position.z) {
      // 增强选中Agent的发光效果，根据层级调整
      const emissiveIntensity = 0.7 + agent.userData.layer * 0.05;
      gsap.to(agent.material, {
        emissiveIntensity: emissiveIntensity,
        duration: 0.5,
      });

      // 保持Agent大小不变，只调整发光效果
      agent.scale.set(1.0, 1.0, 1.0);
    } else {
      // 其他Agent轻微变暗
      gsap.to(agent.material, {
        emissiveIntensity: 0.2,
        duration: 0.5,
      });
      
      // 保持所有Agent大小一致
      agent.scale.set(1.0, 1.0, 1.0);
    }
    });
}

// 绑定UI交互事件
function bindUIEvents() {
    // 开始聊天按钮
  document.getElementById("start-chat").addEventListener("click", function () {
    const agentName = document.getElementById("agent-name").textContent;
    document.getElementById("chat-agent-name").textContent = agentName;

            // 隐藏信息面板
    const infoPanel = document.querySelector(".info-panel");
    infoPanel.classList.remove("visible");
    setTimeout(() => {
      infoPanel.style.display = "none";
    }, 300);
            
    // 显示聊天面板
    const chatPanel = document.querySelector(".chat-panel");
    chatPanel.style.display = "flex";
    setTimeout(() => {
      chatPanel.classList.add("visible");
    }, 10);
            
    // 清空聊天记录，保留初始欢迎消息
    const chatBody = document.querySelector(".chat-body");
    chatBody.innerHTML = "";
            
    // 添加欢迎消息
    const welcomeMessage = `您好！我是${agentName}，很高兴为您服务。请问有什么我可以帮您解答的问题？`;
    addMessageToChat(welcomeMessage, "agent");

    // 开始模拟对话
    startSimulatedConversation(agentName);
    });
    
    // 关闭聊天按钮
  document.getElementById("close-chat").addEventListener("click", function () {
    const chatPanel = document.querySelector(".chat-panel");
    chatPanel.classList.remove("visible");
    setTimeout(() => {
      chatPanel.style.display = "none";
    }, 300);
  });

  // 关闭信息面板按钮
  document.getElementById("close-info").addEventListener("click", function () {
    const infoPanel = document.querySelector(".info-panel");
    infoPanel.classList.remove("visible");
    setTimeout(() => {
      infoPanel.style.display = "none";
      currentAgentId = null;
    }, 300);
    });
    
    // 发送消息按钮
  document
    .getElementById("send-message")
    .addEventListener("click", sendMessage);
    
  // 输入框回车键发送
  document
    .getElementById("message-input")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
            sendMessage();
        }
    });
    
  // 绑定分类筛选按钮
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // 移除所有按钮的active类
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // 为当前按钮添加active类
      this.classList.add("active");
            
      // 获取分类并筛选
      const category = this.getAttribute("data-category");
            filterAgentsByCategory(category);

      // 显示图层说明
      const layerInfo = document.querySelector(".layer-info");
      layerInfo.classList.remove("hidden");
    });

    // 添加鼠标悬停时的预览效果
    button.addEventListener("mouseenter", function () {
      if (!this.classList.contains("active")) {
        const category = this.getAttribute("data-category");
        previewCategory(category);
      }
    });

    // 鼠标离开时恢复原样
    button.addEventListener("mouseleave", function () {
      if (!this.classList.contains("active")) {
        const activeButton = document.querySelector(".filter-btn.active");
        const activeCategory = activeButton.getAttribute("data-category");
        filterAgentsByCategory(activeCategory);
      }
    });
  });
}

// 分类预览效果
function previewCategory(category) {
  if (category === "all") {
    agents.forEach((agent) => {
      agent.visible = true;
      agent.material.opacity = 1;
    });
  } else {
    agents.forEach((agent) => {
      if (agent.userData.category === category) {
        agent.visible = true;
        agent.material.opacity = 1;
      } else {
        agent.material.opacity = 0.2;
      }
    });
  }
}

// 根据分类筛选Agent
function filterAgentsByCategory(category) {
  // 如果显示全部
  if (category === "all") {
    agents.forEach((agent) => {
      // 显示所有Agent
      gsap.to(agent.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.5,
        ease: "back.out",
            });

      gsap.to(agent.material, {
                opacity: 1,
        emissiveIntensity: 0.4,
        duration: 0.5,
      });

      agent.visible = true;
    });

    // 显示所有层的椭圆和效果
    agentGroup.children.forEach((child) => {
      if (child.userData && child.userData.layer) {
        gsap.to(child.material, {
          opacity: child.material.opacity > 0.5 ? 0.8 : 0.3,
          duration: 0.5,
        });
        child.visible = true;
      }
            });
        } else {
    // 根据分类筛选
    const layerMap = {
      inner: 1,
      middle: 2,
      outer: 3,
    };

    const targetLayer = layerMap[category];

    agents.forEach((agent) => {
      if (agent.userData.category === category) {
        // 突出显示所选分类
        gsap.to(agent.scale, {
          x: 1.2,
          y: 1.2,
          z: 1.2,
          duration: 0.5,
          ease: "back.out",
        });

        gsap.to(agent.material, {
          opacity: 1,
          emissiveIntensity: 0.6,
          duration: 0.5,
        });

        agent.visible = true;
      } else {
        // 淡化其他分类
        gsap.to(agent.scale, {
          x: 0.6,
          y: 0.6,
          z: 0.6,
          duration: 0.5,
            });

        gsap.to(agent.material, {
          opacity: 0.2,
          emissiveIntensity: 0.2,
          duration: 0.5,
            });
      }
    });

    // 根据层级显示/隐藏椭圆和效果
    agentGroup.children.forEach((child) => {
      if (child.userData && child.userData.layer) {
        if (child.userData.layer === targetLayer) {
          gsap.to(child.material, {
            opacity: child.material.opacity > 0.5 ? 0.9 : 0.4,
            duration: 0.5,
          });
          child.visible = true;
        } else {
          gsap.to(child.material, {
                opacity: 0.1,
            duration: 0.5,
            });
        }
        }
    });
  }
}

// 发送消息函数
function sendMessage() {
  const input = document.getElementById("message-input");
    const message = input.value.trim();
  if (!message) return;
    
        // 添加用户消息
  addMessageToChat(message, "user");
  input.value = "";
        
  // 显示输入中状态
  showTypingIndicator();
        
  // 模拟AI响应
        setTimeout(() => {
    hideTypingIndicator();
    const response = generateResponse(message);
    addMessageToChat(response.message, "agent");
            
    // 添加新的引导性问题
    setTimeout(() => {
      addGuidingQuestions(response.nextQuestions);
    }, 500);
  }, 1500);
}

// 添加消息到聊天窗口
function addMessageToChat(message, sender) {
  const chatBody = document.querySelector(".chat-body");
  const messageElement = document.createElement("div");
    
  messageElement.className =
    sender === "user"
      ? "user-message chat-message"
      : "agent-message chat-message";
    messageElement.textContent = message;
    
    chatBody.appendChild(messageElement);
    
  // 确保滚动到底部
  scrollChatToBottom();
}

// 专门的滚动到底部函数，可以在多处调用
function scrollChatToBottom() {
  const chatBody = document.querySelector(".chat-body");
  if (chatBody) {
    // 使用setTimeout确保DOM更新后再滚动
    setTimeout(() => {
    chatBody.scrollTop = chatBody.scrollHeight;
    }, 10);
  }
}

// 显示Agent正在输入的提示
function showTypingIndicator() {
  const chatBody = document.querySelector(".chat-body");

  // 检查是否已有输入提示
  if (document.querySelector(".typing-indicator")) return;

  const typingIndicator = document.createElement("div");
  typingIndicator.className = "agent-message chat-message typing-indicator";

  const dot1 = document.createElement("span");
  const dot2 = document.createElement("span");
  const dot3 = document.createElement("span");

  dot1.className = "dot";
  dot2.className = "dot";
  dot3.className = "dot";

  typingIndicator.appendChild(dot1);
  typingIndicator.appendChild(dot2);
  typingIndicator.appendChild(dot3);

  chatBody.appendChild(typingIndicator);
  scrollChatToBottom();
}

// 隐藏Agent正在输入的提示
function hideTypingIndicator() {
  const typingIndicator = document.querySelector(".typing-indicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// 开始模拟自动对话
function startSimulatedConversation(agentName) {
  const agent = agentData.find((a) => a.name === agentName);
  if (!agent) {
    console.warn(`找不到名为 ${agentName} 的Agent`);
    return;
  }

  // 获取聊天窗口元素
  const chatBody = document.querySelector(".chat-body");
  if (!chatBody) {
    console.error("找不到聊天窗口元素");
    return;
  }
  
  // 清空之前的对话
  chatBody.innerHTML = "";

  // 添加初始消息
  const initialMessage = `关于“${agent.name}”，您有什么想问我的？`;
  addMessageToChat(initialMessage, "agent");

  // 生成并显示引导性问题
  setTimeout(() => {
    const guidingQuestions = generateGuidingQuestions(agent);
    addGuidingQuestions(guidingQuestions);
    
    // 额外确保最终滚动到底部
    setTimeout(scrollChatToBottom, 100);
  }, 800);
}

// 生成引导性问题
function generateGuidingQuestions(agent) {
  const questions = {
    ARM服务: [
      "如何优化资产配置策略？",
      "区块链技术如何提升资产管理效率？",
      "权益配置有哪些创新方案？",
    ],
    发行服务: [
      "数字资产发行流程是怎样的？",
      "如何确保发行合规性？",
      "发行后的市场表现如何？",
    ],
    // ... 为每个Agent添加相应的引导性问题
  };

  // 先检查agent对象是否有效，以及skills数组是否存在
  if (!agent || !agent.skills || !Array.isArray(agent.skills) || agent.skills.length === 0) {
    // 返回默认问题
    return [
      "您对这个领域有什么具体问题？",
      "需要了解哪些具体的服务内容？",
      "有什么我可以帮您解答的问题？"
    ];
  }

  return (
    questions[agent.name] || [
      `在${agent.skills[0] || '专业领域'}方面有什么具体问题？`,
      `关于${agent.skills.length > 1 ? agent.skills[1] : '相关技术'}的最新发展是什么？`,
      `如何更好地运用${agent.skills.length > 2 ? agent.skills[2] : '我们的服务'}？`,
    ]
  );
}

// 添加引导性问题到对话框
function addGuidingQuestions(questions) {
  const questionsHtml = questions
    .map(
      (q) => `
        <div class="guiding-question" onclick="selectGuidingQuestion(this)">
            ${q}
        </div>
    `
    )
    .join("");

  const questionsContainer = document.createElement("div");
  questionsContainer.className = "guiding-questions";
  questionsContainer.innerHTML = questionsHtml;
  document.querySelector(".chat-body").appendChild(questionsContainer);
  
  // 添加引导性问题后滚动到底部
  scrollChatToBottom();
}

// 选择引导性问题
function selectGuidingQuestion(element) {
  const question = element.textContent.trim();
  document.getElementById("message-input").value = question;
  sendMessage();
}

// 生成AI响应和下一组引导性问题
function generateResponse(message) {
  // 这里可以根据不同的问题类型生成不同的响应
  return {
    message: `关于"${message}"，我的建议是...`,
    nextQuestions: [
      "您对这个解答还满意吗？",
      "需要了解更多具体细节吗？",
      "是否需要相关的案例分享？",
    ],
  };
}

// 添加样式
const style = document.createElement("style");
style.textContent = `
.guiding-questions {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.guiding-question {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9em;
    color: #94a3b8;
}

.guiding-question:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.3);
    color: #e2e8f0;
}
`;
document.head.appendChild(style);

// 首字母大写
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// 更新星域光晕效果，在背景中添加星尘和星云飘动效果
function addCelestialEffects() {
    // 添加星尘效果 - 小颗粒状的星尘
    const stardust = () => {
        const geometry = new THREE.BufferGeometry();
        const count = 3000;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const colors = new Float32Array(count * 3);
        
        const dustColors = [
            new THREE.Color(0x8BA9FF), // 浅蓝色
            new THREE.Color(0xFFEAD9), // 淡橙色
            new THREE.Color(0xE8DBFF), // 浅紫色
            new THREE.Color(0xCCF5FF)  // 淡青色
        ];
        
        for (let i = 0; i < count; i++) {
            // 在大球体范围内随机分布
            const radius = 100 + Math.random() * 400;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = (radius * Math.sin(phi) * Math.sin(theta)) * 0.6; // 扁平化分布
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // 随机大小
            sizes[i] = Math.random() * 1.5 + 0.1;
            
            // 随机颜色
            const colorIndex = Math.floor(Math.random() * dustColors.length);
            const color = dustColors[colorIndex];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        // 创建自定义着色器材质
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    
                    // 添加轻微漂浮动画
                    vec3 pos = position;
                    pos.x += sin(time * 0.1 + position.z * 0.01) * 2.0;
                    pos.z += cos(time * 0.1 + position.x * 0.01) * 2.0;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    // 创建圆形粒子
                    float r = distance(gl_PointCoord, vec2(0.5, 0.5));
                    if (r > 0.5) discard;
                    
                    // 添加发光边缘
                    float alpha = 1.0 - smoothstep(0.3, 0.5, r);
                    gl_FragColor = vec4(vColor, alpha * 0.5);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        const stardustPoints = new THREE.Points(geometry, material);
        scene.add(stardustPoints);
        
        // 保存动画状态
        if (!window.celestialEffects) window.celestialEffects = [];
        window.celestialEffects.push({
            object: stardustPoints,
            type: 'stardust'
        });
        
        return stardustPoints;
    };
    
    // 创建星域和星云交汇处的光晕效果
    const createGlowEffect = (position, radius, color, intensity) => {
        // 使用半透明的球体表示光晕
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        
        const glow = new THREE.Mesh(geometry, material);
        glow.position.set(position.x, position.y, position.z);
        scene.add(glow);
        
        // 添加更小的核心光球
        const coreGeometry = new THREE.SphereGeometry(radius * 0.3, 24, 24);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.set(position.x, position.y, position.z);
        scene.add(core);
        
        // 添加点光源
        const light = new THREE.PointLight(color, intensity, radius * 3);
        light.position.set(position.x, position.y, position.z);
        scene.add(light);
        
        if (!window.celestialEffects) window.celestialEffects = [];
        window.celestialEffects.push({
            object: glow,
            core: core,
            light: light,
            type: 'glow',
            initialRadius: radius,
            time: Math.random() * 10 // 随机初始时间以避免同步
        });
        
        return { glow, core, light };
    };
    
    // 创建星云网络 - 用曲线连接星云中心点
    const createNebulaConnections = () => {
        // 定义星云中心点
        const nebulaCenters = [
            { x: -180, y: -100, z: -300 },
            { x: 250, y: -30, z: -200 },
            { x: -100, y: 50, z: -350 },
            { x: 300, y: -80, z: -250 },
            { x: -300, y: -100, z: -700 },
            { x: 400, y: 50, z: -600 }
        ];
        
        // 创建网络线
        for (let i = 0; i < nebulaCenters.length; i++) {
            for (let j = i + 1; j < nebulaCenters.length; j++) {
                // 随机决定是否创建连接
                if (Math.random() > 0.4) {
                    // 创建曲线路径
                    const start = new THREE.Vector3(
                        nebulaCenters[i].x, 
                        nebulaCenters[i].y, 
                        nebulaCenters[i].z
                    );
                    
                    const end = new THREE.Vector3(
                        nebulaCenters[j].x, 
                        nebulaCenters[j].y, 
                        nebulaCenters[j].z
                    );
                    
                    // 计算中间控制点
                    const midPoint = new THREE.Vector3().addVectors(start, end).divideScalar(2);
                    
                    // 向中间点添加一些随机偏移
                    midPoint.x += (Math.random() - 0.5) * 100;
                    midPoint.y += (Math.random() - 0.5) * 100;
                    midPoint.z += (Math.random() - 0.5) * 100;
                    
                    // 创建二次贝塞尔曲线
                    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
                    
                    // 将曲线转换为几何体
                    const points = curve.getPoints(50);
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    
                    // 创建线材质 - 使用渐变色
                    const material = new THREE.LineBasicMaterial({ 
                        color: Math.random() > 0.5 ? 0x88AAFF : 0xAA88FF,
                        transparent: true,
                        opacity: 0.15,
                        blending: THREE.AdditiveBlending
                    });
                    
                    const line = new THREE.Line(geometry, material);
                    scene.add(line);
                }
            }
        }
    };
    
    // 添加星尘效果
    stardust();
    
    // 添加星域光晕
    createGlowEffect({ x: -200, y: -50, z: -400 }, 120, 0x4A7CFF, 0.2);
    createGlowEffect({ x: 350, y: -20, z: -350 }, 150, 0xFF6B5E, 0.15);
    createGlowEffect({ x: 0, y: 30, z: -550 }, 200, 0xBB88FF, 0.1);
    
    // 创建星云网络
    createNebulaConnections();
}

// 确保selectGuidingQuestion函数全局可访问
window.selectGuidingQuestion = selectGuidingQuestion;

// 添加窗口大小变化监听器
window.addEventListener("resize", function() {
  // 如果聊天面板可见，重新计算滚动区域
  if (document.querySelector(".chat-panel.visible")) {
    scrollChatToBottom();
  }
});

// 修改关闭聊天面板的函数，确保下次打开时功能正常
document.getElementById("close-chat").addEventListener("click", function() {
  const chatPanel = document.querySelector(".chat-panel");
  chatPanel.classList.remove("visible");
  
  // 使用延时确保过渡动画完成后再隐藏
  setTimeout(() => {
    chatPanel.style.display = "none";
    // 清空聊天内容，为下次打开做准备
    document.querySelector(".chat-body").innerHTML = "";
  }, 300);
});

// 在页面加载完成时初始化聊天面板
document.addEventListener("DOMContentLoaded", function() {
  // 初始化滚动区域
  const chatBody = document.querySelector(".chat-body");
  if (chatBody) {
    // 确保滚动区域正确初始化
    chatBody.scrollTop = 0;
  }
  
  // 确保消息输入框回车发送功能
  const messageInput = document.getElementById("message-input");
  messageInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
});

// 发送消息时重新滚动到底部
function sendMessage() {
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value.trim();
  
  if (message === "") return;
  
  // 添加用户消息
  addMessageToChat(message, "user");
  
  // 清空输入框
  messageInput.value = "";
  
  // 显示Agent正在输入的提示
  showTypingIndicator();
  
  // 模拟Agent回复
  setTimeout(() => {
    // 隐藏输入提示
    hideTypingIndicator();
    
    // 添加Agent回复
    let agentName = document.getElementById("chat-agent-name").textContent;
    const agent = agentData.find((a) => a.name === agentName);
    
    // 处理回复
    const response = generateResponse(message);
    addMessageToChat(response.message, "agent");
    
    // 添加新的引导性问题
    setTimeout(() => {
      addGuidingQuestions(response.nextQuestions);
      // 再次滚动到底部，确保引导问题可见
      scrollChatToBottom();
    }, 500);
  }, 1500);
}

// 添加调试和错误处理的专门滚动函数
function scrollChatToBottom() {
  const chatBody = document.querySelector(".chat-body");
  if (!chatBody) {
    console.warn("聊天窗口未找到，无法滚动");
    return;
  }
  
  // 检查是否需要滚动
  const isScrollable = chatBody.scrollHeight > chatBody.clientHeight;
  
  // 使用setTimeout确保DOM更新后再滚动
  setTimeout(() => {
    try {
      // 强制滚动到底部
      chatBody.scrollTop = chatBody.scrollHeight;
      
      // 调试信息
      if (isScrollable) {
        console.log("聊天窗口已滚动", {
          scrollHeight: chatBody.scrollHeight,
          clientHeight: chatBody.clientHeight,
          scrollTop: chatBody.scrollTop
        });
      }
    } catch (error) {
      console.error("滚动聊天窗口时出错", error);
    }
  }, 20); // 增加延迟时间以确保渲染完成
}
