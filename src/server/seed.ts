import bcrypt from 'bcryptjs';
import { db, User, Project, Asset, Conversation, Message } from './db.ts';

export async function initializeSeedData() {
  const existingUser = db.getUserByEmail('demo@omniverse.ai');
  if (existingUser) return;

  const passwordHash = await bcrypt.hash('password123', 12);
  const now = new Date().toISOString();

  const demoUser: User = {
    id: 'u-demo-1001',
    email: 'demo@omniverse.ai',
    password_hash: passwordHash,
    full_name: 'Dr. Elena Rostova',
    created_at: now,
    updated_at: now,
  };

  const project1: Project = {
    id: 'proj-finance-001',
    user_id: demoUser.id,
    title: 'Q3 Enterprise Financial Audit & Earnings Synthesis',
    description: 'Cross-modal verification between SEC 10-Q filing, CFO earnings call audio, and executive presentation charts.',
    category: 'Finance & Compliance',
    created_at: now,
    updated_at: now,
  };

  const project2: Project = {
    id: 'proj-robotics-002',
    user_id: demoUser.id,
    title: 'Autonomous Navigation & Robotics Sensor Fusion',
    description: 'Multi-sensor drone flight test telemetry video review and multi-agent coordination whitepaper.',
    category: 'Engineering & Research',
    created_at: now,
    updated_at: now,
  };

  const assets: Asset[] = [
    {
      id: 'ast-fin-pdf-01',
      project_id: project1.id,
      user_id: demoUser.id,
      file_name: 'Q3_Consolidated_Financial_Report.pdf',
      file_type: 'pdf',
      file_size: 4325800,
      file_url: '/uploads/samples/Q3_Consolidated_Financial_Report.pdf',
      storage_path: 'samples/Q3_Consolidated_Financial_Report.pdf',
      processing_status: 'COMPLETED',
      extracted_text: `UNITED STATES SECURITIES AND EXCHANGE COMMISSION
FORM 10-Q - QUARTERLY REPORT FOR Q3 2026
CONSOLIDATED STATEMENTS OF OPERATIONS (UNAUDITED)
Total Net Revenues: $412.8M (compared to $342.1M in Q3 2025, an increase of 20.7% YoY).
Enterprise Cloud Services: $286.4M, up 28.3% YoY.
Hardware & Edge Appliances: $126.4M, up 6.1% YoY.
Operating Expenses: $274.2M.
Research & Development: $118.5M (representing 28.7% of total revenue).
Gross Profit Margin: 68.4%, compared to 64.2% in prior period.
Operating Income: $138.6M.
Free Cash Flow: $98.4M.
Total Cash and Cash Equivalents: $1.24B.
Risks and Disclosures: Supply chain component lead times lengthened to 14 weeks for next-gen silicon accelerators in EMEA region.`,
      metadata: {
        summary: 'Q3 2026 financial report indicating $412.8M in revenue (+20.7% YoY) driven by Enterprise Cloud Services ($286.4M), with a gross margin of 68.4% and $98.4M free cash flow.',
        key_topics: ['Q3 Financial Results', 'Cloud Revenue Surge', 'Gross Margin Expansion', 'Silicon Lead Times', 'Operating Income'],
        entities: ['SEC Form 10-Q', 'Enterprise Cloud Services', 'EMEA Operations', 'Silicon Accelerators'],
        extracted_text_summary: 'Consolidated Q3 Net Revenue of $412.8M with 68.4% gross margin; EMEA supply chain risks noted.',
        analysis_profile: 'Deep Compliance Audit',
        pages: [
          { page: 1, heading: 'Consolidated Statement of Operations', snippet: 'Total Net Revenues: $412.8M (+20.7% YoY). Enterprise Cloud: $286.4M.' },
          { page: 3, heading: 'Segment Gross Margins', snippet: 'Gross Profit Margin improved to 68.4% compared to 64.2% prior year.' },
          { page: 7, heading: 'Supply Chain & Risk Disclosures', snippet: 'EMEA silicon component lead times elevated to 14 weeks.' },
        ],
      },
      created_at: now,
    },
    {
      id: 'ast-fin-aud-02',
      project_id: project1.id,
      user_id: demoUser.id,
      file_name: 'CEO_CFO_Earnings_Call_Recording.mp3',
      file_type: 'audio',
      file_size: 19450000,
      file_url: '/uploads/samples/CEO_CFO_Earnings_Call_Recording.mp3',
      storage_path: 'samples/CEO_CFO_Earnings_Call_Recording.mp3',
      processing_status: 'COMPLETED',
      extracted_text: `[00:00 - CEO Opening Remarks]
Good afternoon everyone. In Q3 we saw extraordinary acceleration across our enterprise cloud stack. We surpassed $410 million in revenue, which exceeded the upper band of our guidance.

[01:45 - CFO Margin Commentary]
Thank you, Marcus. Gross margins reached 68.4%. We were able to optimize server utilization by 18% through our internal AI workload scheduler. Operating cash flow stood at nearly $100 million.

[04:20 - Analyst Q&A regarding EMEA and Hardware Constraints]
Analyst (Morgan Stanley): 'Could you comment on international supply chain constraints mentioned in the disclosures?'
CFO: 'Yes, while our cloud subscriptions are completely insulated, our physical edge inference boxes did see 14-week lead times in Europe. However, we have buffered inventory through Q1 2027 to mitigate customer delivery delays.'

[07:10 - Future Outlook & R&D Guidance]
CEO: 'We are raising full-year revenue guidance to $1.68B, and investing heavily into next-gen multimodal reasoning platforms.'`,
      metadata: {
        summary: 'Earnings call transcript highlighting revenue beat above $410M, server utilization gains improving gross margin to 68.4%, and proactive inventory buffering against the 14-week European component lead times.',
        key_topics: ['Executive Guidance Beat', 'Server Optimization', 'European Supply Chain Buffer', 'Full Year Revenue Raise'],
        entities: ['Marcus (CEO)', 'CFO', 'Morgan Stanley Analyst', 'EMEA Division'],
        extracted_text_summary: 'Executive earnings call recording covering Q3 beat, margin improvement, and international inventory strategy.',
        analysis_profile: 'Key Takeaways & Timestamps',
        timestamps: [
          { time: '00:00', note: 'CEO opening remarks on enterprise cloud acceleration and revenue beat' },
          { time: '01:45', note: 'CFO breakdown of 68.4% gross margin and AI scheduler workload efficiency' },
          { time: '04:20', note: 'Analyst Q&A: Clarification of 14-week European hardware lead times & inventory buffer' },
          { time: '07:10', note: 'Upward guidance revision to $1.68B and next-gen multimodal investments' },
        ],
      },
      created_at: now,
    },
    {
      id: 'ast-fin-img-03',
      project_id: project1.id,
      user_id: demoUser.id,
      file_name: 'Revenue_Growth_Chart_Q3.png',
      file_type: 'image',
      file_size: 1840000,
      file_url: '/uploads/samples/Revenue_Growth_Chart_Q3.png',
      storage_path: 'samples/Revenue_Growth_Chart_Q3.png',
      processing_status: 'COMPLETED',
      extracted_text: `OCR EXTRACTION - INFOGRAPHIC & BOARD PRESENTATION SLIDE:
Header: 'Q3 YoY Segment Expansion Breakdown'
Chart Type: Stacked Bar Chart (Q1 2025 to Q3 2026)
Q3 2025: Cloud ($223.2M) + Edge ($118.9M) = Total $342.1M
Q3 2026: Cloud ($286.4M) + Edge ($126.4M) = Total $412.8M
Year-over-Year Delta:
- Cloud Growth: +28.3%
- Edge Hardware Growth: +6.1%
Footnote: 'Data audited according to GAAP standards. Excludes one-time currency fluctuations.'`,
      metadata: {
        summary: 'High-resolution infographic slide illustrating segment revenue shifts: Enterprise Cloud increased from $223.2M to $286.4M (+28.3%), while Edge Hardware rose from $118.9M to $126.4M (+6.1%).',
        key_topics: ['Segment Breakdown', 'YoY Growth Visualization', 'GAAP Standard Audit', 'Cloud Acceleration'],
        entities: ['Board Presentation', 'Enterprise Cloud', 'Edge Hardware', 'GAAP'],
        extracted_text_summary: 'Slide chart detailing segment expansion from $342.1M to $412.8M.',
        analysis_profile: 'Executive Summary',
      },
      created_at: now,
    },
    {
      id: 'ast-fin-txt-04',
      project_id: project1.id,
      user_id: demoUser.id,
      file_name: 'Compliance_Audit_Checklist.txt',
      file_type: 'text',
      file_size: 14200,
      file_url: '/uploads/samples/Compliance_Audit_Checklist.txt',
      storage_path: 'samples/Compliance_Audit_Checklist.txt',
      processing_status: 'COMPLETED',
      extracted_text: `INTERNAL AUDIT & COMPLIANCE VERIFICATION CHECKLIST - Q3 2026
1. Revenue Recognition (ASC 606): Verified. Multi-element software contracts audited across top 50 client accounts.
2. Inventory Valuation (ASC 330): Passed. EMEA edge hardware inventory tested against 14-week lead-time obsolescence risk. Buffer reserves adequate at $18.2M.
3. Cybersecurity & Data Governance: SOC2 Type II compliance re-certified in September 2026. Zero breach notifications.
4. Internal Controls over Financial Reporting (SOX 404): No material weaknesses identified by external audit committee.`,
      metadata: {
        summary: 'Internal compliance verification covering ASC 606 revenue recognition, ASC 330 inventory tests with $18.2M buffer reserves for European hardware, and SOC2 Type II certification.',
        key_topics: ['ASC 606 Revenue Check', 'ASC 330 Inventory Reserve', 'SOC2 Type II', 'SOX 404 Compliance'],
        entities: ['Audit Committee', 'ASC 606', 'ASC 330', 'SOC2 Type II'],
        extracted_text_summary: 'Clean audit checklist with no material weaknesses found.',
        analysis_profile: 'Deep Compliance Audit',
      },
      created_at: now,
    },
    {
      id: 'ast-rob-vid-05',
      project_id: project2.id,
      user_id: demoUser.id,
      file_name: 'Drone_Navigation_Flight_Test.mp4',
      file_type: 'video',
      file_size: 34100000,
      file_url: '/uploads/samples/Drone_Navigation_Flight_Test.mp4',
      storage_path: 'samples/Drone_Navigation_Flight_Test.mp4',
      processing_status: 'COMPLETED',
      extracted_text: `VIDEO LOG & TELEMETRY EXTRACTION:
[00:00] Drone takeoff in GPS-denied indoor warehouse arena. LiDAR point-cloud generation initialized.
[00:45] Obstacle detection: Sudden simulated pipe barrier inserted at 4.2m altitude. Visual-inertial odometry (VIO) rerouted trajectory with 12ms latency.
[02:15] Multi-drone swarm rendezvous test: Drone Alpha and Drone Beta synchronized spatial mapping over Ultra-Wideband (UWB) mesh link.
[04:30] Safe precision landing achieved on charging pad. Drift error < 1.4 cm.`,
      metadata: {
        summary: 'Autonomous drone flight trial in GPS-denied arena demonstrating real-time LiDAR mapping, 12ms obstacle avoidance rerouting, and 1.4cm precision landing.',
        key_topics: ['GPS-Denied Navigation', 'Visual-Inertial Odometry', 'Obstacle Avoidance', 'LiDAR Mapping', 'UWB Mesh'],
        entities: ['Drone Alpha', 'Drone Beta', 'VIO Engine', 'LiDAR Sensor'],
        extracted_text_summary: 'Flight test telemetry demonstrating sub-15ms obstacle reaction and centimeter-accurate landing.',
        analysis_profile: 'Key Takeaways & Timestamps',
        timestamps: [
          { time: '00:00', note: 'Takeoff in GPS-denied indoor environment and LiDAR initialization' },
          { time: '00:45', note: 'Sudden obstacle avoidance with 12ms trajectory replanning' },
          { time: '02:15', note: 'Multi-drone spatial map synchronization over UWB' },
          { time: '04:30', note: 'Precision pad landing with < 1.4cm drift' },
        ],
      },
      created_at: now,
    },
  ];

  const conversation1: Conversation = {
    id: 'conv-fin-001',
    project_id: project1.id,
    user_id: demoUser.id,
    title: 'Cross-Modal Revenue & Supply Chain Synthesis',
    created_at: now,
  };

  const messages: Message[] = [
    {
      id: 'msg-01',
      conversation_id: conversation1.id,
      sender: 'user',
      content: 'Compare the financial figures in the PDF report with the statements made in the CEO and CFO audio interview regarding international risk.',
      citations: [],
      created_at: now,
    },
    {
      id: 'msg-02',
      conversation_id: conversation1.id,
      sender: 'ai',
      content: `### Cross-Modal Synthesis: Q3 Financial Report vs. Executive Audio Interview

A comprehensive correlation between the **SEC Form 10-Q PDF Report** and the **CFO/CEO Earnings Call Audio** reveals tight alignment with important operational nuances regarding international risk:

#### 1. Core Financial Verification
| Metric | 10-Q PDF Report | Earnings Call Audio | Infographic Slide |
| :--- | :--- | :--- | :--- |
| **Total Revenue** | **$412.8M** (+20.7% YoY) | *"Surpassed $410M, exceeding guidance"* | **$412.8M** verified |
| **Gross Margin** | **68.4%** (Page 3) | **68.4%** attributed to AI workload scheduler | Confirmed GAAP |
| **Cloud Services**| **$286.4M** (+28.3% YoY) | Highlighted as primary growth driver | Stacked bar chart top tier |

---

#### 2. Cross-Referencing International Supply Chain Risks
- **In the Written 10-Q Filing:** Page 7 explicitly lists that *"Supply chain component lead times lengthened to 14 weeks for next-gen silicon accelerators in EMEA region."*
- **In the Audio Interview:** During the Analyst Q&A segment at **[04:20]**, the CFO addresses this exact 14-week lead time, clarifying that:
  > *"While cloud subscriptions are completely insulated, our physical edge inference boxes did see 14-week lead times in Europe. However, we have buffered inventory through Q1 2027 to mitigate customer delivery delays."*
- **Internal Audit Confirmation:** The Compliance Checklist confirms an **$18.2M inventory buffer reserve** specifically allocated under ASC 330 to absorb any potential delivery or obsolescence shocks.

---

#### 3. Key Takeaway & Strategic Assessment
The executive statements are fully substantiated by the formal disclosures. The European supply chain risk is strictly confined to hardware edge appliances, and the company has insulated customer operations through buffered stock.`,
      citations: [
        {
          asset_id: 'ast-fin-pdf-01',
          file_name: 'Q3_Consolidated_Financial_Report.pdf',
          file_type: 'pdf',
          citation_label: '[10-Q Filing, Page 7]',
          timestamp_or_page: 'Page 7',
          snippet: 'Supply chain component lead times lengthened to 14 weeks for next-gen silicon accelerators in EMEA region.',
        },
        {
          asset_id: 'ast-fin-aud-02',
          file_name: 'CEO_CFO_Earnings_Call_Recording.mp3',
          file_type: 'audio',
          citation_label: '[Audio Call @ 04:20]',
          timestamp_or_page: '04:20',
          snippet: 'CFO explains 14-week European hardware lead times are protected by buffered inventory through Q1 2027.',
        },
        {
          asset_id: 'ast-fin-img-03',
          file_name: 'Revenue_Growth_Chart_Q3.png',
          file_type: 'image',
          citation_label: '[Slide Chart]',
          timestamp_or_page: 'Segment Breakdown',
          snippet: 'Visual validation of $412.8M total and $286.4M cloud segment.',
        },
        {
          asset_id: 'ast-fin-txt-04',
          file_name: 'Compliance_Audit_Checklist.txt',
          file_type: 'text',
          citation_label: '[ASC 330 Audit]',
          timestamp_or_page: 'Section 2',
          snippet: 'Buffer reserves adequate at $18.2M for European hardware lead times.',
        },
      ],
      created_at: now,
    },
  ];

  db.seedDemoData([demoUser], [project1, project2], assets, [conversation1], messages);
  console.log('Seed demo data initialized successfully with multimodal assets and synthesis history.');
}
