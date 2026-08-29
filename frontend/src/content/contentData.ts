export const contentData = {
	home: {
		hero: {
			headline: "Custom Software for Every Business",
			subheadline: "The Lance crafts tailored software with customized pricing for every business stage from small local shops to large enterprise industries.",
			cta_primary: "Start a Project",
			cta_secondary: "Our Services"
		},
		stats: [
			{ id: "stat-1", value: "7+", label: "Projects Delivered" },
			{ id: "stat-2", value: "4+", label: "Years of Experience" },
			{ id: "stat-3", value: "5+", label: "Happy Clients" },
			{ id: "stat-4", value: "99%", label: "Client Satisfaction" }
		],
		services: {
			heading: "Customized Software & Flexible Pricing",
			subheading: "Tailored engineering designed specifically around your workflow, needs, and budget.",
			items: [
				{ id: "custom", title: "Custom Software", description: "Bespoke software engineered for complex business problems with flexible, customized pricing models to fit your budget.", tag: "Architecture · APIs · Integrations" },
				{ id: "web", title: "Web Development", description: "Bespoke web applications built for your exact needs from local shop storefronts to large-scale enterprise portals.", tag: "React · Node · JavaScript" },
				{ id: "mobile", title: "Mobile Applications", description: "Native and cross-platform mobile apps designed to streamline your business operations and elevate customer experience.", tag: "React Native · iOS · Android" },
				{ id: "cloud", title: "Cloud & DevOps", description: "Cost-optimized infrastructure that grows with you. Scalable setup engineered for small businesses up to large industrial fleets.", tag: "AWS · GCP · Docker · Kubernetes" }
			]
		},
		about: {
			heading: "Precision engineering. Tailored for small shops to big industries.",
			body: [
				{ id: "b1", text: "Founded over a casual chat at our regular tea shop, The Lance brings together senior developers to build customized software with transparent, tailored pricing for every business size." }
			],
			points: [
				{ id: "p1", text: "Customized solutions with tailored pricing for small shops to big industries" },
				{ id: "p2", text: "Born at a tea shop - grounded, straightforward, and accessible" },
				{ id: "p3", text: "Senior engineering team delivering clean, long-lasting architecture" },
				{ id: "p4", text: "9AM - 9PM Support, 7 days/week (because bugs don't take weekends off)" }
			]
		},
		testimonials: {
			heading: "What Our Clients Say",
			subheading: "We let the work - and the people behind it - speak for themselves.",
			items: [
				{ id: "t1", quote: "The Lance gave us a completely customized platform at a price model that actually fit our budget. Their engineering quality and communication are top tier.", name: "Morgan Reynolds", title: "CTO", company: "ScaleX Finance" },
				{ id: "t2", quote: "As a growing business, we needed a custom tool without enterprise price markups. The Lance delivered exactly what we needed, on time and within budget.", name: "Jordan Lee", title: "CEO", company: "Innovate Solutions" },
				{ id: "t3", quote: "From our initial discussion to final deployment, they tailored every module to fit our specific operational workflow.", name: "Taylor Jenkins", title: "Director of Product", company: "Momentum Tech" }
			]
		},
		cta: {
			heading: "Ready to build something great?",
			subheading: "Tell us about your project and we'll craft a customized solution and price tailored for you.",
			button: "Get in Touch"
		}
	},
	services: {
		hero: {
			eyebrow: "Our Capabilities",
			heading: "Customized Software & Tailored Pricing",
			subheading: "From small retail shops to large industrial enterprises, we engineer bespoke digital products built to perform, scale, and fit your exact budget."
		},
		services: [
			{
				id: "web-dev",
				title: "Web Application Development",
				tagline: "Tailored web solutions for any scale",
				description: "We build modern web applications designed specifically for your operational goals. Whether you need a local shop management tool or an enterprise SaaS dashboard, we architect for speed and longevity.",
				features: [
					{ id: "wf1", text: "React, Next.js, and TypeScript front-ends" },
					{ id: "wf2", text: "Node.js, Python, and Go back-ends" },
					{ id: "wf3", text: "Custom API design and third-party integrations" },
					{ id: "wf4", text: "Performance optimization and responsive layouts" }
				],
				tag: "React · Node · TypeScript · PostgreSQL"
			},
			{
				id: "mobile-dev",
				title: "Mobile App Development",
				tagline: "Native experiences tailored to your workflow",
				description: "We design and build mobile apps tailored for your business needs. From consumer-facing mobile apps for local stores to industrial fleet field apps, we deliver speed and reliability.",
				features: [
					{ id: "mf1", text: "iOS (Swift) and Android (Kotlin) native development" },
					{ id: "mf2", text: "React Native for cross-platform efficiency" },
					{ id: "mf3", text: "App Store and Google Play submission" },
					{ id: "mf4", text: "Push notifications, offline sync, and deep linking" }
				],
				tag: "iOS · Android · React Native · Expo"
			},
			{
				id: "cloud-devops",
				title: "Cloud Architecture & DevOps",
				tagline: "Infrastructure optimized for your budget",
				description: "We architect and manage cloud environments that are secure, reliable, and cost-efficient. We scale infrastructure according to your real-world usage so you never overpay.",
				features: [
					{ id: "cf1", text: "AWS, GCP, and Azure cloud architecture" },
					{ id: "cf2", text: "CI/CD pipelines and automated deployments" },
					{ id: "cf3", text: "Docker and Kubernetes orchestration" },
					{ id: "cf4", text: "Monitoring, alerting, and cost-optimization" }
				],
				tag: "AWS · GCP · Docker · Kubernetes · Terraform"
			},
			{
				id: "custom-dev",
				title: "Custom Business & Industrial Software",
				tagline: "Bespoke solutions with customized pricing",
				description: "No cookie-cutter templates or bloated packages. We analyze your unique requirements and build customized software with a price plan tailored specifically for small shops to big industries.",
				features: [
					{ id: "ef1", text: "Workflow automation for small shops and large plants" },
					{ id: "ef2", text: "Custom third-party API and hardware integrations" },
					{ id: "ef3", text: "Internal tools, dashboards, and reporting systems" },
					{ id: "ef4", text: "Flexible custom pricing plans with zero lock-ins" }
				],
				tag: "Architecture · Custom Pricing · APIs · Integrations"
			}
		],
		process: {
			heading: "How We Collaborate",
			subheading: "A clear, collaborative process from first call to final delivery.",
			steps: [
				{ id: "step-1", number: "01", title: "Discovery & Custom Quote", description: "We sit down with you to understand your specific business needs and budget, providing a transparent, customized proposal." },
				{ id: "step-2", number: "02", title: "Architecture & Design", description: "We blueprint a tailored solution that fits your exact workflow before writing code, ensuring maximum clarity." },
				{ id: "step-3", number: "03", title: "Iterative Build", description: "Regular updates and weekly demos keep you completely in the loop as your custom software comes to life." },
				{ id: "step-4", number: "04", title: "Launch & Support", description: "We deploy your software seamlessly and provide ongoing support to keep your operations running smoothly." }
			]
		},
		cta: {
			heading: "Have a project in mind?",
			subheading: "Let’s talk about how we can build a customized solution with a price that works for you.",
			button: "Start a Project"
		}
	},
	about: {
		hero: {
			eyebrow: "About The Lance",
			heading: "Started at a Tea Shop. Built for Everyone.",
			subheading: "We started The Lance with a spontaneous conversation at our regular tea shop. Today, we build customized software solutions with tailored pricing for everyone — from small local shops to large industrial enterprises."
		},
		story: {
			heading: "Our Origin Story",
			paragraphs: [
				{ id: "sp1", text: "The Lance wasn't born in a fancy corporate office — it started over tea at our regular local tea shop ☕. What began as a casual chat among developer friends turned into a simple mission: build custom software that's accessible and affordable for everyone. No 50-page slides or overthinking — we just finished our tea and launched it." },
				{ id: "sp2", text: "From tea-stall talks to building software for local shops and big industrial plants, our focus remains unchanged: custom solutions with tailored pricing, zero corporate bloat, and code that actually works (and yes, we still drink way too much tea)." }
			]
		},
		mission: {
			heading: "Our Core Principles",
			statement: "To empower businesses of all sizes from small shops to big industries with custom-engineered software and transparent, tailored pricing.",
			values: [
				{ id: "v1", title: "Customized for Every Business", description: "No one-size-fits-all packages. We engineer tailored solutions and custom price points suited for small shops up to large industrial enterprises." },
				{ id: "v2", title: "Grounded & Transparent", description: "Rooted in our tea shop origin, we communicate in plain language with total clarity and no hidden surprises." },
				{ id: "v3", title: "Senior-only Execution", description: "Every project is designed and delivered by experienced engineers who care deeply about your product's success." },
				{ id: "v4", title: "Built for Longevity", description: "We focus on clean architecture and sustainable software design that serves your business for years to come." }
			]
		},
		team: {
			heading: "The people behind the work",
			subheading: "A dedicated team of senior developers bringing custom software solutions to businesses of all sizes.",
			members: [
				{ id: "m1", name: "Jaykumar A", role: "Senior Manager - Engineering", bio: "7+ years of experience in Engineering Management. Obsessed with building scalable and reliable systems." },
				{ id: "m2", name: "Dhinakaran Sekar", role: "Senior Full-Stack Developer", bio: "5+ years building distributed systems at scale. Obsessed with clean architecture and fast feedback loops." }
			]
		},
		cta: {
			heading: "Want to work with us?",
			subheading: "Whether you run a small shop or a large enterprise, let's discuss your custom project and tailored pricing.",
			button: "Start a Conversation"
		}
	},
	work: {
		hero: {
			eyebrow: "Selected Work",
			heading: "Projects we're proud of",
			subheading: "A selection of customized products we've engineered and shipped for businesses ranging from emerging startups to enterprise fleets."
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
		],
		cta: {
			heading: "Have a Custom Project in Mind?",
			subheading: "Tell us about your goals and let's create a customized solution with pricing built for you.",
			button: "Start a Conversation"
		}
	},
	contact: {
		hero: {
			eyebrow: "Contact Us",
			heading: "Let's Build Something Great",
			subheading: "Fill out the project inquiry form below. We'll respond within 24 hours with a customized proposal."
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
