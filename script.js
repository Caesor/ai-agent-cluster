// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 模拟加载
    setTimeout(() => {
        document.querySelector('.loader').style.opacity = 0;
        setTimeout(() => {
            document.querySelector('.loader').style.display = 'none';
        }, 500);
    }, 1500);
    
    // 初始化3D场景
    initScene();
    
    // 绑定UI交互事件
    bindUIEvents();
});

// 全局变量
let scene, camera, renderer, controls;
let agentGroup, agents = [];
let currentAgentId = null;
let raycaster, mouse;
let tooltip = document.getElementById('agent-tooltip');
let pulseEffects = [], dataFlowEffects = [], particleEffects = [];
let isInitialLoad = true;

// 各层使用不同的配色方案
const layerColors = {
    inner: {
        base: "#305866",
        variants: ["#305866", "#2D5060", "#336269", "#386B74", "#356670"]
    },
    middle: {
        base: "#4B5762",
        variants: ["#4B5762", "#444F5A", "#515D68", "#475359", "#4E5A65"]
    },
    outer: {
        base: "#704E4B",
        variants: ["#704E4B", "#654642", "#7A5450", "#603E3B", "#755249"]
    }
};

// 修改Agent数据分布，缩小环的大小但保持图标大小不变
const agentData = [
    // 第一层（最内层）：基础服务
    { id: 1, name: "ARM服务", category: "inner", layer: 1, position: [0, 0, 1.5], color: layerColors.inner.variants[0], 
      skills: ["资产管理", "权益配置", "区块链", "金融科技"],
      description: "提供区块链资产配置权益管理服务，帮助用户实现资产权益的精确配置和管理。" },
    { id: 2, name: "发行服务", category: "inner", layer: 1, position: [1.3, 0, 0.75], color: layerColors.inner.variants[1], 
      skills: ["资产发行", "上市咨询", "流程管理", "合规服务"],
      description: "专注于数字资产发行全流程服务，为企业和机构提供一站式发行解决方案。" },
    { id: 3, name: "认购服务", category: "inner", layer: 1, position: [1.3, 0, -0.75], color: layerColors.inner.variants[2], 
      skills: ["认购管理", "投资流程", "资金对接", "智能合约"],
      description: "提供数字资产认购流程管理，优化投资者认购体验，确保合规高效。" },
    { id: 4, name: "结算服务", category: "inner", layer: 1, position: [0, 0, -1.5], color: layerColors.inner.variants[3], 
      skills: ["资金结算", "交易清算", "实时处理", "安全保障"],
      description: "实现资产交易的实时结算服务，保证资金流转安全与交易效率。" },
    { id: 5, name: "托管服务", category: "inner", layer: 1, position: [-1.3, 0, -0.75], color: layerColors.inner.variants[4], 
      skills: ["资产托管", "数字保管", "安全协议", "多签验证"],
      description: "提供安全可靠的数字资产托管解决方案，满足机构级别的安全需求。" },
    { id: 6, name: "市场参与者", category: "inner", layer: 1, position: [-1.3, 0, 0.75], color: layerColors.inner.variants[0], 
      skills: ["生态协作", "市场对接", "参与者管理", "多方协调"],
      description: "连接各类市场参与者，促进生态系统内的高效协作和交互。" },
    
    // 第二层（中间层）：专业支持
    { id: 7, name: "产品设计", category: "middle", layer: 2, position: [0, 0, 2.7], color: layerColors.middle.variants[0], 
      skills: ["产品创新", "需求分析", "方案设计", "市场测试"],
      description: "基于用户需求和市场趋势，设计创新的金融产品和服务模式。" },
    { id: 8, name: "风控管理", category: "middle", layer: 2, position: [1.35, 0, 2.33], color: layerColors.middle.variants[1], 
      skills: ["风险评估", "安全监控", "合规管理", "数据分析"],
      description: "提供全面的风险评估、监控和管理服务，确保资产安全和合规运营。" },
    { id: 9, name: "资产评级", category: "middle", layer: 2, position: [2.33, 0, 1.35], color: layerColors.middle.variants[2], 
      skills: ["项目评级", "风险分析", "投资评估", "数据建模"],
      description: "基于多维度数据分析，为投资标的提供客观公正的评级服务。" },
    { id: 10, name: "估值服务", category: "middle", layer: 2, position: [2.7, 0, 0], color: layerColors.middle.variants[3], 
      skills: ["资产估值", "价格发现", "算法模型", "市场分析"],
      description: "运用先进算法和市场数据，提供精确的资产估值和价格发现服务。" },
    { id: 11, name: "税务规划", category: "middle", layer: 2, position: [2.33, 0, -1.35], color: layerColors.middle.variants[4], 
      skills: ["税收优化", "跨境税务", "合规筹划", "政策分析"],
      description: "提供全球税务解决方案，优化投资结构，合法合规降低税负。" },
    { id: 12, name: "跨境通道", category: "middle", layer: 2, position: [1.35, 0, -2.33], color: layerColors.middle.variants[0], 
      skills: ["跨境投资", "通道搭建", "法规对接", "资金流转"],
      description: "搭建安全合规的跨境投资通道，实现资产的全球化配置。" },
    { id: 13, name: "法律安排", category: "middle", layer: 2, position: [0, 0, -2.7], color: layerColors.middle.variants[1], 
      skills: ["法律架构", "合同设计", "权益保障", "争议预防"],
      description: "提供专业的法律架构设计和合同文本服务，保障交易合法有效。" },
    { id: 14, name: "争议解决", category: "middle", layer: 2, position: [-1.35, 0, -2.33], color: layerColors.middle.variants[2], 
      skills: ["纠纷调解", "仲裁支持", "诉讼协助", "和解方案"],
      description: "提供高效的争议解决方案，包括调解、仲裁和司法诉讼支持。" },
    { id: 15, name: "收入分成ABC", category: "middle", layer: 2, position: [-2.33, 0, -1.35], color: layerColors.middle.variants[3], 
      skills: ["利益分配", "智能合约", "收益管理", "透明机制"],
      description: "基于智能合约设计收入分成机制，实现自动化、透明化的利益分配。" },
    { id: 16, name: "投资案例库", category: "middle", layer: 2, position: [-2.7, 0, 0], color: layerColors.middle.variants[4], 
      skills: ["案例分析", "行业洞察", "经验分享", "决策支持"],
      description: "汇集行业优质投资案例，提供详细分析和经验分享，助力投资决策。" },
    { id: 17, name: "投后管理", category: "middle", layer: 2, position: [-2.33, 0, 1.35], color: layerColors.middle.variants[0], 
      skills: ["绩效跟踪", "风险监控", "价值提升", "战略规划"],
      description: "提供全周期投后管理服务，包括绩效跟踪、风险监控和价值提升。" },
    { id: 18, name: "行业专家", category: "middle", layer: 2, position: [-1.35, 0, 2.33], color: layerColors.middle.variants[1], 
      skills: ["专家咨询", "行业分析", "市场洞察", "发展预测"],
      description: "连接各行业顶尖专家资源，提供专业咨询和深度洞察。" },
    
    // 第三层（最外层）：增值服务
    { id: 19, name: "最新资讯", category: "outer", layer: 3, position: [0, 0, 3.9], color: layerColors.outer.variants[0], 
      skills: ["行业动态", "政策解读", "市场分析", "趋势预测"],
      description: "实时追踪行业动态，提供高价值资讯和深度分析报告。" },
    { id: 20, name: "21章项目", category: "outer", layer: 3, position: [1.95, 0, 3.38], color: layerColors.outer.variants[1], 
      skills: ["21章项目", "咨询服务", "资源对接", "合规指导"],
      description: "专注于21章项目的咨询和服务，帮助企业高效合规地获取资源。" },
    { id: 21, name: "创始人对话", category: "outer", layer: 3, position: [3.38, 0, 1.95], color: layerColors.outer.variants[2], 
      skills: ["团队沟通", "创始人对接", "项目评估", "愿景解读"],
      description: "提供与投资项目创始人直接对话的渠道，深入了解项目愿景和团队能力。" },
    { id: 22, name: "行业报告", category: "outer", layer: 3, position: [3.9, 0, 0], color: layerColors.outer.variants[3], 
      skills: ["深度报告", "数据分析", "趋势研究", "行业预测"],
      description: "提供各行业全面深入的研究报告，基于大数据分析的市场趋势和投资机会。" },
    { id: 23, name: "专业咨询", category: "outer", layer: 3, position: [3.38, 0, -1.95], color: layerColors.outer.variants[4], 
      skills: ["专业咨询", "问题诊断", "解决方案", "实施指导"],
      description: "提供专业领域的深度咨询服务，针对复杂问题提供系统化解决方案。" },
    { id: 24, name: "资产配置", category: "outer", layer: 3, position: [1.95, 0, -3.38], color: layerColors.outer.variants[0], 
      skills: ["资产规划", "风险分散", "回报优化", "长期管理"],
      description: "基于客户目标和风险偏好，设计全球化的资产配置方案。" },
    { id: 25, name: "项目孵化", category: "outer", layer: 3, position: [0, 0, -3.9], color: layerColors.outer.variants[1], 
      skills: ["创业辅导", "资源对接", "投融资支持", "成长规划"],
      description: "为有潜力的创新项目提供全方位孵化服务，加速项目成长。" },
    { id: 26, name: "交易策略", category: "outer", layer: 3, position: [-1.95, 0, -3.38], color: layerColors.outer.variants[2], 
      skills: ["策略设计", "量化分析", "风险控制", "绩效评估"],
      description: "设计专业的交易策略，提供量化分析和算法支持。" },
    { id: 27, name: "金融工具", category: "outer", layer: 3, position: [-3.38, 0, -1.95], color: layerColors.outer.variants[3], 
      skills: ["工具设计", "功能优化", "使用培训", "效果评估"],
      description: "开发和优化专业金融工具，提升投资管理效率和准确性。" },
    { id: 28, name: "数据分析", category: "outer", layer: 3, position: [-3.9, 0, 0], color: layerColors.outer.variants[4], 
      skills: ["数据挖掘", "趋势识别", "预测模型", "可视化分析"],
      description: "提供强大的数据分析能力，挖掘市场洞察和投资机会。" },
    { id: 29, name: "市场研究", category: "outer", layer: 3, position: [-3.38, 0, 1.95], color: layerColors.outer.variants[0], 
      skills: ["市场调研", "竞争分析", "行业评估", "发展预测"],
      description: "深入研究目标市场，提供全面的市场分析和预测报告。" },
    { id: 30, name: "风险评估", category: "outer", layer: 3, position: [-1.95, 0, 3.38], color: layerColors.outer.variants[1], 
      skills: ["风险识别", "影响评估", "缓解策略", "监控系统"],
      description: "系统评估投资风险，设计有效的风险管理和缓解方案。" }
];

// 初始化3D场景
function initScene() {
    // 创建场景
    scene = new THREE.Scene();
    
    // 创建相机 - 完全固定俯瞰视角
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 0); // 固定相机位置在正上方俯瞰
    camera.lookAt(0, 0, 0);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制像素比，提高性能
    document.getElementById('scene-container').appendChild(renderer.domElement);
    
    // 创建控制器 - 完全禁止旋转，只允许缩放
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0;  // 禁止旋转
    controls.enableRotate = false; // 完全禁止旋转
    
    // 固定视角在顶部
    controls.minPolarAngle = 0; // 固定为俯视视角
    controls.maxPolarAngle = 0;
    
    // 限制缩放范围
    controls.minDistance = 12;
    controls.maxDistance = 18;
    
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
    window.addEventListener('resize', onWindowResize);
    
    // 点击和鼠标移动事件
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onMouseClick);
    
    // 启动动画效果
    setTimeout(() => {
        isInitialLoad = false;
    }, 2000);
}

// 创建星空背景 - 更丰富的星空效果
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.07,
        transparent: true,
        opacity: 0.7
    });
    
    const starsVertices = [];
    for (let i = 0; i < 6000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // 添加一些更亮的星星点缀
    const brightStarsGeometry = new THREE.BufferGeometry();
    const brightStarsMaterial = new THREE.PointsMaterial({
        color: 0xaaccff,
        size: 0.12,
        transparent: true,
        opacity: 0.9
    });
    
    const brightStarsVertices = [];
    for (let i = 0; i < 200; i++) {
        const x = (Math.random() - 0.5) * 500;
        const y = (Math.random() - 0.5) * 500;
        const z = (Math.random() - 0.5) * 500;
        brightStarsVertices.push(x, y, z);
    }
    
    brightStarsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(brightStarsVertices, 3));
    const brightStars = new THREE.Points(brightStarsGeometry, brightStarsMaterial);
    scene.add(brightStars);
}

// 创建三层椭圆结构 - 优化椭圆大小和间距
function createThreeLayerStructure() {
    // 将三层比例调整为更合理的大小，方便视觉区分
    createEllipseLayer(1.5, 1.5, layerColors.inner.base, 1); // 内层 - 基础服务
    createEllipseLayer(2.7, 2.7, layerColors.middle.base, 2); // 中层 - 专业支持
    createEllipseLayer(3.9, 3.9, layerColors.outer.base, 3); // 外层 - 增值服务
}

// 创建单层椭圆形结构 - 更精细的椭圆结构
function createEllipseLayer(radiusX, radiusY, color, layer) {
    // 创建椭圆路径
    const curve = new THREE.EllipseCurve(
        0, 0,                   // 中心点
        radiusX, radiusY,       // X和Y半径
        0, 2 * Math.PI,         // 起始角度和结束角度
        false,                  // 是否逆时针
        0                       // 旋转角度
    );
    
    // 生成椭圆上的点 - 增加分段数提高平滑度
    const points = curve.getPoints(180);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // 创建主椭圆线
    const material = new THREE.LineBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.9,
        linewidth: 2
    });
    
    const ellipse = new THREE.Line(geometry, material);
    ellipse.position.y = 0.02 * layer; // 轻微垂直分隔以避免Z-fighting
    ellipse.userData = { 
        layer: layer,
        type: 'ellipse',
        baseOpacity: 0.9
    };
    agentGroup.add(ellipse);
    
    // 创建内发光效果 - 添加一层稍微模糊的线
    const glowMaterial = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4,
        linewidth: 4
    });
    
    const glowEllipse = new THREE.Line(geometry, glowMaterial);
    glowEllipse.position.y = 0.02 * layer;
    glowEllipse.userData = { 
        layer: layer,
        type: 'ellipse',
        baseOpacity: 0.4
    };
    agentGroup.add(glowEllipse);
    
    // 添加圆环底色 - 为三环添加浅色透明底色
    const ringWidth = 0.35;
    const ringGeometry = new THREE.RingGeometry(
        radiusX - ringWidth/2,  // 内半径
        radiusX + ringWidth/2,  // 外半径
        80,                     // 圆周分段数
        1                       // 径向分段数
    );
    
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2; // 旋转至水平面
    ring.position.y = 0.01 * layer; // 轻微垂直分隔
    ring.userData = { 
        layer: layer,
        type: 'ellipse',
        baseOpacity: 0.18
    };
    agentGroup.add(ring);
    
    // 添加辅助环线 - 增加额外的细环线增强视觉效果
    const thinRingGeometry = new THREE.RingGeometry(
        radiusX - ringWidth/2 - 0.05,  // 内细环
        radiusX - ringWidth/2 - 0.02,
        80, 1
    );
    
    const thinRingMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    
    const thinRing1 = new THREE.Mesh(thinRingGeometry, thinRingMaterial);
    thinRing1.rotation.x = Math.PI / 2;
    thinRing1.position.y = 0.015 * layer;
    thinRing1.userData = { 
        layer: layer,
        type: 'ellipse',
        baseOpacity: 0.3
    };
    agentGroup.add(thinRing1);
    
    const thinRingGeometry2 = new THREE.RingGeometry(
        radiusX + ringWidth/2 + 0.02,  // 外细环
        radiusX + ringWidth/2 + 0.05,
        80, 1
    );
    
    const thinRing2 = new THREE.Mesh(thinRingGeometry2, thinRingMaterial);
    thinRing2.rotation.x = Math.PI / 2;
    thinRing2.position.y = 0.015 * layer;
    thinRing2.userData = { 
        layer: layer,
        type: 'ellipse',
        baseOpacity: 0.3
    };
    agentGroup.add(thinRing2);
    
    // 添加动态粒子效果
    addParticlesEffect(radiusX, radiusY, color, layer);
    
    // 添加脉冲环效果
    addPulseRingEffect(radiusX, radiusY, color, layer);
    
    // 添加数据流效果
    addDataFlowEffect(radiusX, radiusY, color, layer);
}

// 添加动态粒子效果 - 改进粒子效果，使其更流畅和密集
function addParticlesEffect(radiusX, radiusY, color, layer) {
    const particlesCount = 100; // 增加粒子数量
    const particlesMaterial = new THREE.PointsMaterial({
        color: color,
        size: 0.05,
        transparent: true,
        opacity: 0.8
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
        particlesPositions[i * 3 + 1] = 0.02 * layer; // 轻微垂直分隔
        particlesPositions[i * 3 + 2] = z;
        
        // 根据层级设置不同速度
        particlesSpeeds.push(0.006 + (layer * 0.001));
        }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    particles.userData = { 
        type: 'particles', 
        radiusX: radiusX,
        radiusY: radiusY,
        speeds: particlesSpeeds,
        layer: layer
    };
    agentGroup.add(particles);
    
    // 保存到粒子效果数组中
    particleEffects.push(particles);
}

// 添加脉冲环效果 - 更精细和光滑的脉冲环
function addPulseRingEffect(radiusX, radiusY, color, layer) {
    // 创建脉冲环几何体
    const curve = new THREE.EllipseCurve(
        0, 0,
        radiusX, radiusY,
        0, 2 * Math.PI,
        false,
        0
    );
    
    // 增加细分段以获得更光滑的曲线
    const points = curve.getPoints(180);
    const pulseGeometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // 脉冲环材质
    const pulseMaterial = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.2,
        linewidth: 2
    });
    
    // 创建多个脉冲环
    for (let i = 0; i < 3; i++) {
        const pulseRing = new THREE.Line(pulseGeometry, pulseMaterial);
        pulseRing.position.y = 0.02 * layer;
        pulseRing.userData = {
            type: 'pulse',
            originalScaleX: 1,
            originalScaleY: 1,
            pulsePhase: i * 1.047, // 120度相位差
            layer: layer,
            pulseSpeed: 0.02 - (layer * 0.003) // 根据层级设置不同速度
        };
        
        // 保存到脉冲效果数组中
        pulseEffects.push(pulseRing);
        agentGroup.add(pulseRing);
    }
}

// 添加数据流效果 - 更流畅的数据流动画
function addDataFlowEffect(radiusX, radiusY, color, layer) {
    const flowPointsCount = 6; // 每个数据流上的点数量
    const flowCount = 6; // 每层的数据流数量
    
    // 为每个流创建点
    for (let f = 0; f < flowCount; f++) {
        const flowAngle = (f / flowCount) * Math.PI * 2; // 均匀分布
        
        const flowPositions = new Float32Array(flowPointsCount * 3);
        const flowGeometry = new THREE.BufferGeometry();
        
        // 创建沿着圆形轨迹的点，作为初始位置
        for (let i = 0; i < flowPointsCount; i++) {
            const segmentLength = 0.1; // 数据流中点之间的间隔
            const angle = flowAngle + (i * segmentLength);
            
            const x = radiusX * Math.cos(angle);
            const z = radiusY * Math.sin(angle);
            
            flowPositions[i * 3] = x;
            flowPositions[i * 3 + 1] = 0.03 * layer; // 轻微抬高，使其可见
            flowPositions[i * 3 + 2] = z;
        }
        
        // 设置几何体的位置属性
        flowGeometry.setAttribute('position', new THREE.BufferAttribute(flowPositions, 3));
        
        // 创建材质
        const flowMaterial = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6,
            linewidth: 1.5
        });
        
        // 创建线条
        const dataFlow = new THREE.Line(flowGeometry, flowMaterial);
        dataFlow.userData = {
            type: 'dataFlow',
            flowAngle: flowAngle,
            speed: 0.02 + (Math.random() * 0.02), // 随机速度，增加变化
            radiusX: radiusX,
            radiusY: radiusY,
            layer: layer,
            pointsCount: flowPointsCount,
            segmentLength: 0.1 // 与上面设置保持一致
        };
        
        agentGroup.add(dataFlow);
        
        // 保存到数据流效果数组中
        dataFlowEffects.push(dataFlow);
    }
}

// 创建Agent图标 - 改进Agent图标样式，始终显示名称标签
function createAgentIcons() {
    agents = [];
    
    // 为每个Agent创建图标
    agentData.forEach(agent => {
        // 创建基本几何体 - 圆球
        const geometry = new THREE.SphereGeometry(0.25, 32, 32);
        
        // 发光材质
        const material = new THREE.MeshStandardMaterial({
            color: agent.color,
            emissive: agent.color,
            emissiveIntensity: 0.4,
            roughness: 0.3,
            metalness: 0.8
        });
        
        // 创建网格
        const sphere = new THREE.Mesh(geometry, material);
        
        // 设置位置
        sphere.position.set(
            agent.position[0],
            0.1 + (agent.layer * 0.05), // 根据层级微调高度
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
            skills: agent.skills || []
        };
        
        // 添加到场景
        agentGroup.add(sphere);
        
        // 保存到agents数组
        agents.push(sphere);
        
        // 计算标签位置 - 减小标签与图标的距离
        const labelDirection = new THREE.Vector3(agent.position[0], 0, agent.position[2]).normalize();
        const labelOffset = 0.35 + (agent.layer * 0.03); // 减小偏移量，使标签更靠近图标
        const labelPos = {
            x: agent.position[0] + labelDirection.x * labelOffset,
            y: 0.35 + (agent.layer * 0.05), // 调低文字高度
            z: agent.position[2] + labelDirection.z * labelOffset
        };
        
        // 为Agent添加名称标签 - 永久显示
        const nameSprite = createTextSprite(agent.name, agent.color);
        nameSprite.position.set(labelPos.x, labelPos.y, labelPos.z);
        nameSprite.scale.set(1.7, 0.45, 1); // 调整文字精灵大小，使其更紧凑
        nameSprite.userData = {
            agentId: agent.id,
            type: 'label'
        };
        nameSprite.visible = true; // 始终显示标签
        agentGroup.add(nameSprite);
        
        // 为Agent添加连接中心点的线
        const connectionMaterial = new THREE.LineDashedMaterial({
            color: agent.color,
            linewidth: 1,
            transparent: true,
            opacity: 0.3,
            dashSize: 0.1,
            gapSize: 0.05,
        });
        
        const connectionGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0.05, 0),
            new THREE.Vector3(agent.position[0], 0.1, agent.position[2])
        ]);
        
        const connectionLine = new THREE.Line(connectionGeometry, connectionMaterial);
        connectionLine.computeLineDistances(); // 计算虚线所需的距离
        connectionLine.userData = {
            agentId: agent.id,
            type: 'connection'
        };
        agentGroup.add(connectionLine);
    });
        
    // 初始显示全部Agent
    filterAgentsByCategory('all');
}

// 创建文本精灵 - 优化文本标签效果，增强可见度
function createTextSprite(text, color) {
    // 创建Canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
        
    // 设置Canvas大小，减小高度使文本更紧凑
    canvas.width = 256;
    canvas.height = 48; // 减小高度
    
    // 填充透明背景
    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // 设置文本样式 - 减小字体大小使其更紧凑
    context.font = 'bold 22px Rajdhani';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
        
    // 增强文本阴影效果 - 使用深色阴影增加对比度
    context.shadowColor = 'rgba(0,0,0,0.95)'; // 增强阴影不透明度
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
        transparent: true
    });
    
    // 创建精灵 - 使用更适合的尺寸
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1.5, 0.4, 1); // 更紧凑的缩放比例
    
    return sprite;
}

// 颜色增亮函数 - 使颜色更亮
function brightenColor(hexColor, percent) {
    // 如果是带#的颜色，去掉#
    hexColor = hexColor.replace('#', '');
    
    // 解析RGB值
    let r = parseInt(hexColor.substr(0, 2), 16);
    let g = parseInt(hexColor.substr(2, 2), 16);
    let b = parseInt(hexColor.substr(4, 2), 16);
    
    // 增加RGB值
    r = Math.min(255, Math.floor(r * (100 + percent) / 100));
    g = Math.min(255, Math.floor(g * (100 + percent) / 100));
    b = Math.min(255, Math.floor(b * (100 + percent) / 100));
    
    // 转回十六进制
    return `#${(r).toString(16).padStart(2, '0')}${(g).toString(16).padStart(2, '0')}${(b).toString(16).padStart(2, '0')}`;
}

// 窗口调整大小处理
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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
    particleEffects.forEach(particles => {
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
    
    // 更新脉冲环效果
    pulseEffects.forEach(pulse => {
        // 更新脉冲相位
        pulse.userData.pulsePhase += pulse.userData.pulseSpeed;
        
        // 脉冲效果 - 使用正弦函数来创建平滑的脉冲
        const scaleMultiplier = 1 + 0.2 * Math.sin(pulse.userData.pulsePhase);
        
        // 应用缩放
        pulse.scale.set(
            scaleMultiplier * pulse.userData.originalScaleX,
            1,
            scaleMultiplier * pulse.userData.originalScaleY
        );
        
        // 根据缩放调整不透明度，创造淡入淡出效果
        pulse.material.opacity = 0.1 + 0.2 * (1 - (scaleMultiplier - 1) / 0.2);
    });
    
    // 更新数据流效果
    dataFlowEffects.forEach(flow => {
        // 更新流动角度
        flow.userData.flowAngle += flow.userData.speed;
        
        // 如果完成一圈，重置到随机位置
        if (flow.userData.flowAngle > Math.PI * 2) {
            flow.userData.flowAngle = Math.random() * Math.PI * 2;
            flow.userData.speed = 0.02 + (Math.random() * 0.02);
            
            // 调整透明度
            flow.material.opacity = 0.6 + Math.random() * 0.4;
        }
        
        // 更新数据流中每个点的位置
        const positions = flow.geometry.attributes.position.array;
        const pointsCount = flow.userData.pointsCount;
        const segmentLength = flow.userData.segmentLength;
        
        for (let i = 0; i < pointsCount; i++) {
            const angle = flow.userData.flowAngle + (i * segmentLength);
            
            // 计算新位置
            positions[i * 3] = flow.userData.radiusX * Math.cos(angle);
            positions[i * 3 + 2] = flow.userData.radiusY * Math.sin(angle);
        }
        
        // 通知Three.js更新顶点
        flow.geometry.attributes.position.needsUpdate = true;
    });
    
    // 更新椭圆脉动效果 - 为椭圆添加微妙的呼吸效果
    agentGroup.children.forEach(child => {
        if (child.userData && child.userData.type === 'ellipse') {
            const time = Date.now() * 0.001;
            const layer = child.userData.layer;
            const breathSpeed = 0.2 + layer * 0.1; // 不同层级有不同频率
            
            // 微妙的呼吸效果
            const breathAmount = 0.03 * Math.sin(time * breathSpeed);
            
            child.material.opacity = child.userData.baseOpacity + breathAmount;
        }
    });
    
    // 更新Agent球体效果
    agents.forEach(agent => {
        // 轻微上下浮动 - 减小浮动幅度
        const floatY = 0.02 * Math.sin(Date.now() * 0.0008 + agent.userData.id * 0.5);
        agent.position.y = 0.1 + (agent.userData.layer * 0.05) + floatY;
        
        // 找到对应的名称标签并同步更新位置
        agentGroup.children.forEach(child => {
            if (child.userData.type === 'label' && child.userData.agentId === agent.userData.id) {
                // 使名称标签与Agent同步浮动，但幅度稍小
                child.position.y = 0.35 + (agent.userData.layer * 0.05) + floatY * 0.8;
            }
        });
    });
}

// 鼠标移动事件处理 - 改进鼠标悬停交互，名称标签已永久显示
function onMouseMove(event) {
    // 计算归一化的设备坐标
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
    // 更新射线
    raycaster.setFromCamera(mouse, camera);
    
    // 获取与Agent球体的交点
    const intersects = raycaster.intersectObjects(agents);
    
    // 重置所有Agent外观
    agents.forEach(agent => {
        // 恢复默认大小和颜色
        if (agent.userData.id !== currentAgentId) {
            agent.scale.set(1, 1, 1);
            agent.material.emissiveIntensity = 0.4;
        }
    });
    
    // 隐藏提示框
    tooltip.style.display = 'none';
    tooltip.classList.remove('visible');
    
    // 如果有交点
    if (intersects.length > 0) {
        const agent = intersects[0].object;
        
        // 高亮显示悬停的Agent
        if (agent.userData.id !== currentAgentId) {
            agent.scale.set(1.3, 1.3, 1.3);
            agent.material.emissiveIntensity = 0.8;
        }
        
        // 显示提示框
        tooltip.style.display = 'block';
        tooltip.textContent = agent.userData.name;
        
        // 计算提示框位置
        const vector = new THREE.Vector3();
        vector.copy(agent.position);
        vector.project(camera);
        
        tooltip.style.left = (window.innerWidth / 2) + (vector.x * window.innerWidth / 2) + 'px';
        tooltip.style.top = (window.innerHeight / 2) - (vector.y * window.innerHeight / 2) + 'px';
        
        // 添加显示动画
        setTimeout(() => {
            tooltip.classList.add('visible');
        }, 10);
    }
        }
        
// 获取层级名称
function getLayerName(layer) {
    switch(layer) {
        case 1:
            return '内层基础服务';
        case 2:
            return '中层专业支持';
        case 3:
            return '外层增值服务';
        default:
            return '未知层级';
    }
}

// 鼠标点击事件处理 - 改进点击交互和信息显示
function onMouseClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(agents);
    
    if (intersects.length > 0) {
        const agent = intersects[0].object;
        currentAgentId = agent.userData.id;
        
        // 显示Agent信息面板
        const infoPanel = document.querySelector('.info-panel');
        infoPanel.style.display = 'block';
        
        // 添加显示动画
        setTimeout(() => {
            infoPanel.classList.add('visible');
        }, 10);
        
        // 更新面板信息
        document.getElementById('agent-name').textContent = agent.userData.name;
        document.getElementById('agent-category').textContent = getLayerName(agent.userData.layer);
        document.getElementById('agent-description').textContent = agent.userData.description;
        
        // 更新技能标签
        const skillsContainer = document.getElementById('agent-skills');
        skillsContainer.innerHTML = '';
        
        if (agent.userData.skills && agent.userData.skills.length > 0) {
            agent.userData.skills.forEach(skill => {
                const skillTag = document.createElement('span');
                skillTag.className = 'px-2 py-1 text-xs bg-opacity-50 rounded-full';
        
                // 根据Agent层级设置技能标签颜色
                switch(agent.userData.layer) {
                    case 1:
                        skillTag.classList.add('bg-[#305866]');
                        break;
                    case 2:
                        skillTag.classList.add('bg-[#4B5762]');
                        break;
                    case 3:
                        skillTag.classList.add('bg-[#704E4B]');
                        break;
                    default:
                        skillTag.classList.add('bg-blue-900');
                }
                
                skillTag.textContent = skill;
                skillsContainer.appendChild(skillTag);
            });
        } else {
            // 默认技能
            const defaultSkills = ['智能分析', '资产管理', '交易服务'];
            defaultSkills.forEach(skill => {
                const skillTag = document.createElement('span');
                skillTag.className = 'px-2 py-1 text-xs bg-blue-900 bg-opacity-50 rounded-full';
                skillTag.textContent = skill;
                skillsContainer.appendChild(skillTag);
            });
        }
        
        // 聚焦到Agent
        focusOnAgent(agent.position);
    }
}

// 聚焦到特定Agent位置
function focusOnAgent(position) {
    // 计算新的目标位置 - 确保中心点仍然保持在场景原点
    // 只需要小幅度调整相机焦点，而不是完全移到Agent位置
    const adjustedTarget = {
        x: position.x * 0.3, // 只聚焦一小部分，保持整体场景视图
        y: position.y,
        z: position.z * 0.3
    };
    
    // 使用GSAP创建平滑的过渡动画
    gsap.to(controls.target, {
        x: adjustedTarget.x,
        y: adjustedTarget.y,
        z: adjustedTarget.z,
        duration: 1.2, // 增加动画时间使过渡更平滑
        ease: 'power2.inOut', // 使用更平滑的缓动函数
        onUpdate: function() {
            // 在过渡中每帧更新控制器
            controls.update();
}
    });
    
    // 同时调整相机位置，保持整体视图
    const cameraYPosition = camera.position.y;
    gsap.to(camera.position, {
        y: cameraYPosition * 0.95, // 轻微调整相机高度，增强交互感
        duration: 1.2,
        ease: 'power2.inOut',
        onUpdate: function() {
            camera.lookAt(controls.target);
        },
        onComplete: function() {
            // 完成后轻微回弹，增加活力
            gsap.to(camera.position, {
                y: cameraYPosition,
                duration: 0.8,
                ease: 'elastic.out(1, 0.3)'
            });
        }
    });
    
    // 高亮显示选中的Agent
    agents.forEach(agent => {
        if (agent.position.x === position.x && agent.position.z === position.z) {
            // 增强选中Agent的发光效果
            gsap.to(agent.material, {
                emissiveIntensity: 0.8,
                duration: 0.5
            });
            
            // 轻微放大Agent
            gsap.to(agent.scale, {
                x: 1.3,
                y: 1.3,
                z: 1.3,
                duration: 0.5,
                ease: 'back.out'
            });
        } else {
            // 其他Agent轻微变暗
            gsap.to(agent.material, {
                emissiveIntensity: 0.2,
                duration: 0.5
            });
        }
    });
}

// 绑定UI交互事件
function bindUIEvents() {
    // 开始聊天按钮
    document.getElementById('start-chat').addEventListener('click', function() {
        const agentName = document.getElementById('agent-name').textContent;
        document.getElementById('chat-agent-name').textContent = agentName;
        
            // 隐藏信息面板
        const infoPanel = document.querySelector('.info-panel');
        infoPanel.classList.remove('visible');
        setTimeout(() => {
            infoPanel.style.display = 'none';
        }, 300);
        
        // 显示聊天面板
        const chatPanel = document.querySelector('.chat-panel');
        chatPanel.style.display = 'flex';
        setTimeout(() => {
            chatPanel.classList.add('visible');
        }, 10);
            
        // 清空聊天记录，保留初始欢迎消息
        const chatBody = document.querySelector('.chat-body');
        chatBody.innerHTML = '';
            
        // 添加欢迎消息
        const welcomeMessage = `您好！我是${agentName}，很高兴为您服务。请问有什么我可以帮您解答的问题？`;
        addMessageToChat(welcomeMessage, 'agent');
        
        // 开始模拟对话
        startSimulatedConversation(agentName);
    });
    
    // 关闭聊天按钮
    document.getElementById('close-chat').addEventListener('click', function() {
        const chatPanel = document.querySelector('.chat-panel');
        chatPanel.classList.remove('visible');
        setTimeout(() => {
            chatPanel.style.display = 'none';
        }, 300);
    });
    
    // 关闭信息面板按钮
    document.getElementById('close-info').addEventListener('click', function() {
        const infoPanel = document.querySelector('.info-panel');
        infoPanel.classList.remove('visible');
        setTimeout(() => {
            infoPanel.style.display = 'none';
            currentAgentId = null;
        }, 300);
    });
    
    // 关闭图层说明按钮
    document.getElementById('close-layer-info').addEventListener('click', function() {
        const layerInfo = document.querySelector('.layer-info');
        layerInfo.classList.add('hidden');
    });
    
    // 发送消息按钮
    document.getElementById('send-message').addEventListener('click', sendMessage);
    
    // 输入框回车键发送
    document.getElementById('message-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // 绑定分类筛选按钮
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // 为当前按钮添加active类
            this.classList.add('active');
            
            // 获取分类并筛选
            const category = this.getAttribute('data-category');
            filterAgentsByCategory(category);
            
            // 显示图层说明
            const layerInfo = document.querySelector('.layer-info');
            layerInfo.classList.remove('hidden');
        });
        
        // 添加鼠标悬停时的预览效果
        button.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                const category = this.getAttribute('data-category');
                previewCategory(category);
            }
        });
        
        // 鼠标离开时恢复原样
        button.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                const activeButton = document.querySelector('.filter-btn.active');
                const activeCategory = activeButton.getAttribute('data-category');
                filterAgentsByCategory(activeCategory);
            }
        });
    });
}

// 分类预览效果
function previewCategory(category) {
    if (category === 'all') {
        agents.forEach(agent => {
            agent.visible = true;
            agent.material.opacity = 1;
        });
    } else {
        agents.forEach(agent => {
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
    if (category === 'all') {
    agents.forEach(agent => {
            // 显示所有Agent
            gsap.to(agent.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.5,
                ease: 'back.out'
            });
            
            gsap.to(agent.material, {
                opacity: 1,
                emissiveIntensity: 0.4,
                duration: 0.5
            });
            
            agent.visible = true;
            
            // 显示所有连接线
            agentGroup.children.forEach(child => {
                if (child.userData.type === 'connection' && child.userData.agentId === agent.userData.id) {
                    gsap.to(child.material, {
                        opacity: 0.3,
                        duration: 0.5
                    });
                    child.visible = true;
                }
            });
        });
        
        // 显示所有层的椭圆和效果
        agentGroup.children.forEach(child => {
            if (child.userData && child.userData.layer) {
                gsap.to(child.material, {
                    opacity: child.material.opacity > 0.5 ? 0.8 : 0.3,
                    duration: 0.5
                });
                child.visible = true;
            }
        });
    } else {
        // 根据分类筛选
        const layerMap = {
            'inner': 1,
            'middle': 2,
            'outer': 3
        };
        
        const targetLayer = layerMap[category];
        
        agents.forEach(agent => {
            if (agent.userData.category === category) {
                // 突出显示所选分类
                gsap.to(agent.scale, {
                    x: 1.2, y: 1.2, z: 1.2,
                    duration: 0.5,
                    ease: 'back.out'
                });
                
                gsap.to(agent.material, {
                opacity: 1,
                    emissiveIntensity: 0.6,
                duration: 0.5
            });
                
                agent.visible = true;
                
                // 显示连接线
                agentGroup.children.forEach(child => {
                    if (child.userData.type === 'connection' && child.userData.agentId === agent.userData.id) {
                        gsap.to(child.material, {
                            opacity: 0.5,
                duration: 0.5
                        });
                        child.visible = true;
                    }
            });
        } else {
                // 淡化其他分类
                gsap.to(agent.scale, {
                    x: 0.6, y: 0.6, z: 0.6,
                duration: 0.5
            });
                
                gsap.to(agent.material, {
                    opacity: 0.2,
                    emissiveIntensity: 0.2,
                duration: 0.5
            });
                
                // 隐藏连接线
                agentGroup.children.forEach(child => {
                    if (child.userData.type === 'connection' && child.userData.agentId === agent.userData.id) {
                        gsap.to(child.material, {
                opacity: 0.1,
                duration: 0.5
            });
        }
    });
}
        });
        
        // 根据层级显示/隐藏椭圆和效果
        agentGroup.children.forEach(child => {
            if (child.userData && child.userData.layer) {
                if (child.userData.layer === targetLayer) {
                    gsap.to(child.material, {
                        opacity: child.material.opacity > 0.5 ? 0.9 : 0.4,
                        duration: 0.5
                    });
                    child.visible = true;
                } else {
                    gsap.to(child.material, {
                        opacity: 0.1,
                        duration: 0.5
                    });
                }
            }
        });
    }
}

// 发送消息函数
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (message) {
        // 添加用户消息到聊天窗口
        addMessageToChat(message, 'user');
        
        // 清空输入框
        messageInput.value = '';
        
        // 显示Agent正在输入的提示
        showTypingIndicator();
        
        // 模拟AI Agent回复
        setTimeout(() => {
            // 隐藏输入提示
            hideTypingIndicator();
            
            const agentName = document.getElementById('chat-agent-name').textContent;
            const agentReplies = [
                `作为${agentName}，我可以帮您解析相关业务数据和流程。需要了解更多细节吗？`,
                `您提到的问题涉及到滴灌通澳门交易所的关键业务领域，我们可以从以下几个方面进行讨论...`,
                `根据滴灌通澳门交易所的业务模式，您的问题可以这样理解：首先需要明确投资目标，然后分析可行性...`,
                `感谢您的问题。从专业角度来看，这涉及到几个关键步骤和注意事项，我来为您详细介绍。`,
                `您好，这个问题很有价值。基于滴灌通澳门交易所的运营模式，我建议您考虑以下几点...`
            ];
            
            // 随机选择一个回复
            const randomReply = agentReplies[Math.floor(Math.random() * agentReplies.length)];
            addMessageToChat(randomReply, 'agent');
        }, 1500);
    }
}

// 添加消息到聊天窗口
function addMessageToChat(message, sender) {
    const chatBody = document.querySelector('.chat-body');
    const messageElement = document.createElement('div');
    
    messageElement.className = sender === 'user' ? 'user-message chat-message' : 'agent-message chat-message';
    messageElement.textContent = message;
    
    chatBody.appendChild(messageElement);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// 显示Agent正在输入的提示
function showTypingIndicator() {
    const chatBody = document.querySelector('.chat-body');
    
    // 检查是否已有输入提示
    if (document.querySelector('.typing-indicator')) return;
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'agent-message chat-message typing-indicator';
    
    const dot1 = document.createElement('span');
    const dot2 = document.createElement('span');
    const dot3 = document.createElement('span');
    
    dot1.className = 'dot';
    dot2.className = 'dot';
    dot3.className = 'dot';
    
    typingIndicator.appendChild(dot1);
    typingIndicator.appendChild(dot2);
    typingIndicator.appendChild(dot3);
    
    chatBody.appendChild(typingIndicator);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// 隐藏Agent正在输入的提示
function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// 开始模拟自动对话
function startSimulatedConversation(agentName) {
    // 预设的对话内容
    const conversationScript = [
        { text: "请问您能介绍一下滴灌通澳门交易所的主要业务吗？", sender: "user" },
        { text: `作为${agentName}，我很乐意为您介绍。滴灌通澳门交易所是一个专注于数字资产交易和管理的平台，主要业务包括资产发行、交易撮合、结算托管、风险管理等服务。特别是在区块链资产权益管理方面，我们有着领先的技术和解决方案。`, sender: "agent" },
        { text: "在数字资产发行方面有什么特色服务？", sender: "user" },
        { text: "我们提供全流程的数字资产发行服务，包括资产定义、智能合约开发、合规审核、发行流程管理等。平台通过区块链技术确保资产发行的透明度和安全性，同时专业的咨询团队可以为发行方提供定制化的解决方案，满足不同企业的特定需求。", sender: "agent" },
        { text: "这些服务如何保证合规性？", sender: "user" },
        { text: "合规是我们的首要原则。平台内置了完善的合规审核机制，严格遵循澳门及国际相关金融法规。我们的法律团队会对每个项目进行全面尽职调查，确保所有交易活动符合监管要求。同时，平台还采用多重签名、实时监控等技术手段，防范洗钱和欺诈行为，保障用户资产安全。", sender: "agent" }
    ];
    
    // 模拟延迟时间(毫秒)
    const userTypingDelay = 2000;  // 用户输入延迟
    const agentResponseDelay = 2500;  // Agent响应延迟
    
    // 开始模拟对话
    let currentMessageIndex = 0;
    
    function simulateNextMessage() {
        if (currentMessageIndex >= conversationScript.length) {
            return; // 对话结束
        }
        
        const currentMessage = conversationScript[currentMessageIndex];
        
        if (currentMessage.sender === 'user') {
            // 显示用户正在输入
            setTimeout(() => {
                // 添加用户消息
                addMessageToChat(currentMessage.text, 'user');
                
                // 显示Agent正在输入
                setTimeout(() => {
                    showTypingIndicator();
                    currentMessageIndex++;
                    simulateNextMessage();
                }, 500);
            }, userTypingDelay);
        } else {
            // Agent响应
            setTimeout(() => {
                hideTypingIndicator();
                addMessageToChat(currentMessage.text, 'agent');
                currentMessageIndex++;
                simulateNextMessage();
            }, agentResponseDelay);
        }
    }
    
    // 启动模拟对话
    setTimeout(simulateNextMessage, 1000);
}

// 首字母大写
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}