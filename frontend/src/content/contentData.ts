export const contentData = {
  home: {
    hero: {
      headline: "We Build Software That Scales",
      subheadline: "The Lance is a software development studio crafting precise, high-performance digital products — from web platforms to mobile apps and cloud infrastructure.",
      cta_primary: "Start a Project",
      cta_secondary: "Our Services"
    },
    stats: [
      { id: "stat-1", value: "50+", label: "Projects Delivered" },
      { id: "stat-2", value: "8", label: "Years of Experience" },
      { id: "stat-3", value: "30+", label: "Happy Clients" },
      { id: "stat-4", value: "99%", label: "Client Satisfaction" }
    ],
    services: {
      heading: "What We Build",
      subheading: "End-to-end software development across every layer of the stack.",
      items: [
        { id: "web", title: "Web Development", description: "Scalable web applications built with modern frameworks. From marketing sites to complex SaaS platforms, we engineer for performance and longevity.", tag: "React · Node · JavaScript" },
        { id: "mobile", title: "Mobile Applications", description: "Native and cross-platform mobile experiences that users love. iOS and Android development with a focus on speed, reliability, and intuitive design.", tag: "React Native · iOS · Android" },
        { id: "cloud", title: "Cloud & DevOps", description: "Infrastructure that grows with you. We architect and manage cloud environments, CI/CD pipelines, and deployment strategies for zero-downtime operations.", tag: "AWS · GCP · Docker · Kubernetes" },
        { id: "custom", title: "Custom Software", description: "Bespoke solutions for complex business problems. When off-the-shelf tools fall short, we engineer exactly what you need — nothing more, nothing less.", tag: "Architecture · APIs · Integrations" }
      ]
    },
    about: {
      heading: "Precision engineering for ambitious products.",
      body: [
        { id: "b1", text: "We don't just write code — we solve problems. The Lance brings together senior engineers, product thinkers, and technical architects to deliver software that works at scale." }
      ],
      points: [
        { id: "p1", text: "Senior-only engineering team — no juniors on your project" },
        { id: "p2", text: "Transparent process with weekly progress updates" },
        { id: "p3", text: "Built to last — clean architecture, full documentation" },
        { id: "p4", text: "Post-launch support and continuous improvement" }
      ]
    },
    testimonials: {
      heading: "What Our Clients Say",
      subheading: "We let the work — and the people behind it — speak for themselves.",
      items: [
        { id: "t1", quote: "The Lance rebuilt our entire treasury platform in under six months. The architecture is rock-solid and the team communicated every step of the way. Best engineering partner we've worked with.", name: "Morgan Reynolds", title: "CTO", company: "ScaleX Finance" },
        { id: "t2", quote: "The Lance rebuilt our entire treasury platform in under six months. The architecture is rock-solid and the team communicated every step of the way. Best engineering partner we've worked with.", name: "Jordan Lee", title: "CEO", company: "Innovate Solutions" },
        { id: "t3", quote: "The Lance rebuilt our entire treasury platform in under six months. The architecture is rock-solid and the team communicated every step of the way. Best engineering partner we've worked with.", name: "Taylor Jenkins", title: "Director of Product", company: "Momentum Tech" },
        { id: "t4", quote: "The Lance rebuilt our entire treasury platform in under six months. The architecture is rock-solid and the team communicated every step of the way. Best engineering partner we've worked with.", name: "Sam Carter", title: "Head of Engineering", company: "Apex Systems" }
      ]
    },
    cta: {
      heading: "Ready to build something great?",
      subheading: "Tell us about your project and we'll get back to you within 24 hours.",
      button: "Get in Touch"
    }
  },
  services: {
    hero: {
      eyebrow: "Our Capabilities",
      heading: "Software built for the long run",
      subheading: "From early-stage MVPs to enterprise-scale platforms, we engineer software that performs, scales, and lasts."
    },
    services: [
      {
        id: "web-dev",
        title: "Web Application Development",
        tagline: "Fast, scalable web applications",
        description: "We build modern web applications that handle real traffic and real complexity. Whether you need a marketing site, a SaaS dashboard, or a full-stack platform, we architect for performance from day one.",
        features: [
          { id: "wf1", text: "React, Next.js, and TypeScript front-ends" },
          { id: "wf2", text: "Node.js, Python, and Go back-ends" },
          { id: "wf3", text: "REST and GraphQL API design" },
          { id: "wf4", text: "Performance optimization and Core Web Vitals" }
        ],
        tag: "React · Node · TypeScript · PostgreSQL"
      },
      {
        id: "mobile-dev",
        title: "Mobile App Development",
        tagline: "Native experiences on every device",
        description: "We design and develop mobile apps that users actually enjoy. From consumer apps to internal tools, we deliver polished iOS and Android experiences with a focus on speed and reliability.",
        features: [
          { id: "mf1", text: "iOS (Swift) and Android (Kotlin) native development" },
          { id: "mf2", text: "React Native for cross-platform efficiency" },
          { id: "mf3", text: "App Store and Google Play submission" },
          { id: "mf4", text: "Push notifications, offline support, and deep linking" }
        ],
        tag: "iOS · Android · React Native · Expo"
      },
      {
        id: "cloud-devops",
        title: "Cloud Architecture & DevOps",
        tagline: "Infrastructure that grows with you",
        description: "We architect and manage cloud environments that are reliable, secure, and cost-efficient. From initial setup to ongoing operations, we handle the infrastructure so your team can focus on the product.",
        features: [
          { id: "cf1", text: "AWS, GCP, and Azure architecture" },
          { id: "cf2", text: "CI/CD pipelines and automated deployments" },
          { id: "cf3", text: "Docker and Kubernetes orchestration" },
          { id: "cf4", text: "Monitoring, alerting, and incident response" }
        ],
        tag: "AWS · GCP · Docker · Kubernetes · Terraform"
      },
      {
        id: "custom-dev",
        title: "Custom Enterprise Software",
        tagline: "Bespoke solutions for complex problems",
        description: "When off-the-shelf tools fall short, we build exactly what you need. We work closely with your team to understand the problem deeply, then engineer a solution that fits — nothing more, nothing less.",
        features: [
          { id: "ef1", text: "Legacy system modernization and migration" },
          { id: "ef2", text: "Third-party API and data integrations" },
          { id: "ef3", text: "Internal tools and workflow automation" },
          { id: "ef4", text: "Technical architecture and consulting" }
        ],
        tag: "Architecture · APIs · Integrations · Consulting"
      }
    ],
    process: {
      heading: "How We Collaborate",
      subheading: "A clear, collaborative process from first call to final delivery.",
      steps: [
        { id: "step-1", number: "01", title: "Discovery", description: "We start by understanding your business, users, and goals. A focused discovery phase ensures we build the right thing — not just the requested thing." },
        { id: "step-2", number: "02", title: "Architecture", description: "Before writing a line of code, we design the system. Clear architecture decisions upfront prevent costly rewrites later." },
        { id: "step-3", number: "03", title: "Build", description: "Iterative development with weekly demos. You see progress every week and can course-correct early — no big-bang surprises at the end." },
        { id: "step-4", number: "04", title: "Launch & Support", description: "We handle deployment, monitoring setup, and post-launch support. Your product is in good hands long after the initial build." }
      ]
    },
    cta: {
      heading: "Have a project in mind?",
      subheading: "Let’s talk about how we can help you build something great.",
      button: "Start a Project"
    }
  },
  about: {
    hero: {
      eyebrow: "About The Lance",
      heading: "Built by engineers, for builders",
      subheading: "The Lance was founded on a simple belief: great software comes from deep craft, honest communication, and a relentless focus on what actually matters."
    },
    story: {
      heading: "Engineered for Longevity",
      paragraphs: [
        { id: "sp1", text: "The Lance was founded in 2018 by a team of senior engineers who were tired of watching good ideas fail because of poor technical execution. We'd seen it from both sides — as engineers inside large companies and as consultants brought in to fix what others had broken."
        },
        { id: "sp2", text: "We started small, taking on a handful of projects where we could go deep rather than wide. That focus on quality over volume became our identity. Today, we work with a select group of clients at any given time — because we believe the best work comes from genuine partnership, not a production line." }
      ]
    },
    mission: {
      heading: "Our Core Principles",
      statement: "To provide world-class software engineering with uncompromised quality, integrity, and clarity.",
      values: [
        { id: "v1", title: "Craft over speed", description: "We take the time to do it right. Shortcuts create debt that someone always pays later — usually the client." },
        { id: "v2", title: "Radical transparency", description: "No surprises. You'll always know where things stand, what's blocking progress, and what we'd do differently if we could." },
        { id: "v3", title: "Senior-only execution", description: "Every project is led and delivered by senior engineers. We don't use your project to train juniors." },
        { id: "v4", title: "Long-term thinking", description: "We build for the next five years, not the next sprint. Architecture decisions today shape what's possible tomorrow." }
      ]
    },
    team: {
      heading: "The people behind the work",
      subheading: "A small, senior team with deep expertise across the full stack.",
      members: [
        { id: "m1", name: "Dhinakaran Sekar", role: "Senior Full-Stack Developer", bio: "5+ years building distributed systems at scale. Previously at Stripe and Cloudflare. Obsessed with clean architecture and fast feedback loops." },
        { id: "m2", name: "Rupali Verma", role: "Product & Growth", bio: "5+ years of experience in Product Management and Growth Hacking. Previously at Flipkart. Obsessed with building products that users love." }
      ]
    },
    cta: {
      heading: "Want to work with us?",
      subheading: "We take on a limited number of new projects each quarter. If you have something worth building, let's talk.",
      button: "Start a Conversation"
    }
  },
  work: {
    hero: {
      eyebrow: "Selected Work",
      heading: "Projects we're proud of",
      subheading: "A selection of products we've designed, engineered, and shipped — from early-stage MVPs to large-scale platforms."
    },
    projects: [
      {
        id: "project-1",
        title: "Endpoint Management System",
        category: "Enterprise · Security & IT",
        tagline: "Complete visibility and control over every device, user, and application",
        description: "We built a full-featured endpoint management platform from the ground up — covering device inventory, live monitoring, user activity, USB & website blocking, application tracking, and remote software management. Deployed across enterprise fleets with real-time telemetry and policy enforcement.",
        outcomes: [
          { id: "o1", metric: "9", label: "feature modules" },
          { id: "o2", metric: "Real-time", label: "live monitoring" },
          { id: "o3", metric: "₹500", label: "per user / year" }
        ],
        tags: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"]
      },
      {
        id: "project-2",
        title: "Enterprise Endpoint Security System",
        category: "Security & Systems",
        tagline: "Cross-platform device management & monitoring suite",
        description: "Engineered a centralized endpoint management platform for real-time device control, policy enforcement, and live activity tracking.",
        outcomes: [
          { id: "o3", metric: "99.99%", label: "System Reliability" },
          { id: "o4", metric: "10,000+", label: "Endpoints Supported" }
        ],
        tags: ["TypeScript", "Electron", "React", "Go", "Docker"]
      }
    ],
    cta: {
      heading: "Have an Ambitious Project?",
      subheading: "Tell us about your engineering goals and let's bring it to life.",
      button: "Start a Conversation"
    }
  },
  contact: {
    hero: {
      eyebrow: "Contact Us",
      heading: "Let's Build Something Great",
      subheading: "Fill out the project inquiry form below. Our engineering leads respond within 24 hours."
    },
    info: {
      email: "contact@thelance.in",
      location: "Coimbatore, Tamilnadu, IN.",
      response: "We respond within 24 hours on business days."
    },
    services_options: [
      { id: "opt-web", label: "Web Development" },
      { id: "opt-mobile", label: "Mobile Apps" },
      { id: "opt-cloud", label: "Cloud & DevOps" },
      { id: "opt-custom", label: "Custom Software" },
      { id: "opt-ems", label: "Endpoint Management System" }
    ]
  },
  endpoint_management: {
    hero: {
      eyebrow: "Security & Management",
      heading: "Endpoint Management System",
      subheading: "Total fleet visibility, live device telemetry, USB blocking, and remote policy management in one powerful platform.",
      cta_primary: "View Pricing",
      cta_secondary: "Schedule Demo"
    },
    features: [
      { id: "ef-1", title: "Fleet Inventory & Status", description: "Real-time visibility into operating systems, hardware specs, and connected networks across all enterprise endpoints." },
      { id: "ef-2", title: "Live Activity & Process Monitor", description: "Inspect active processes, resource utilization, and background services remotely." },
      { id: "ef-3", title: "Peripheral & Network Access Control", description: "Enforce USB device access policies, website filtering, and application blacklists instantly." }
    ],
    pricing: {
      heading: "Simple, Predictable Per-User Pricing",
      subheading: "All security modules included without tiered lockouts.",
      price: "$500",
      period: "/ user / year",
      note: "Billed annually. Volume discount available for 10+ seats.",
      includes_heading: "What's Included:",
      includes: [
        { id: "inc-1", text: "Unlimited Device Registrations per User" },
        { id: "inc-2", text: "Real-time Telemetry & Remote Command Execution" },
        { id: "inc-3", text: "24/7 Enterprise Technical Support" }
      ],
      cta: "Get Started",
      cta_sub: "Instant deployment with 14-day evaluation"
    },
    cta: {
      heading: "Secure Your Enterprise Endpoints",
      subheading: "Talk to our security engineers to request an enterprise trial or custom deployment.",
      button: "Request Demo"
    }
  },
  ems_pricing: {
    hero: {
      eyebrow: "Pricing & Plans",
      heading: "Simple, transparent pricing",
      subheading: "One plan. Every feature. No hidden fees. Volume discounts kick in automatically above 10 users."
    },
    plans: {
      monthly_label: "Monthly Billing",
      yearly_label: "Yearly Billing",
      yearly_badge: "Save up to 10%",
      price_monthly: 50,
      price_yearly: 500,
      price_volume_yearly: 450,
      price_volume_monthly: 45,
      volume_threshold: 10,
      volume_note: "Volume discount ($450/yr or $45/mo) applies automatically for teams over 10 seats.",
      currency: "₹",
      period_monthly: "user / month",
      period_yearly: "user / year",
      cta: "Start 14-Day Free Trial",
      cta_sub: "No credit card required to start"
    },
    includes_heading: "Everything Included in All Plans:",
    includes: [
      { id: "plan-inc-1", text: "Device Inventory" },
      { id: "plan-inc-2", text: "Live Monitoring" },
      { id: "plan-inc-3", text: "User Monitoring" },
      { id: "plan-inc-4", text: "USB Blocking" },
      { id: "plan-inc-5", text: "Website Blocking" },
      { id: "plan-inc-6", text: "Monitor Installed Applications" },
      { id: "plan-inc-7", text: "Application Usage Analytics" },
      { id: "plan-inc-8", text: "Software Management" },
      { id: "plan-inc-9", text: "Real-time dashboard & reporting" },
      { id: "plan-inc-10", text: "Reporting & Analytics" },
      { id: "plan-inc-11", text: "24/7 Technical Support" },
      { id: "plan-inc-12", text: "Custom Integrations" },
      { id: "plan-inc-13", text: "Priority Support" },
      { id: "plan-inc-14", text: "Custom Security Policies" }
    ],
    faq: [
      { id: "faq-1", question: "Can I add or remove user seats at any time?", answer: "Yes, seats can be updated dynamically from your administrative management dashboard." },
      { id: "faq-2", question: "Is there a trial period available?", answer: "We offer a fully featured 14-day trial with no credit card required." }
    ],
    cta: {
      heading: "Ready to secure your endpoints?",
      subheading: "Start your 14-day free trial. Full access, no credit card needed.",
      button: "Start Free Trial",
      button_secondary: "Talk to Sales"
    }
  }
};
