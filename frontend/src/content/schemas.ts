import { z } from 'zod';
export const schemas = {
    home: z.object({
        "hero": z.object({
            "headline": z.string(),
            "subheadline": z.string(),
            "cta_primary": z.string(),
            "cta_secondary": z.string()
        }),
        "stats": z.array(z.object({
            "id": z.string(),
            "value": z.string(),
            "label": z.string()
        })),
        "services": z.object({
            "heading": z.string(),
            "subheading": z.string(),
            "items": z.array(z.object({
                "id": z.string(),
                "title": z.string(),
                "description": z.string(),
                "tag": z.string()
            }))
        }),
        "about": z.object({
            "heading": z.string(),
            "body": z.array(z.object({
                "id": z.string(),
                "text": z.string()
            })),
            "points": z.array(z.object({
                "id": z.string(),
                "text": z.string()
            }))
        }),
        "testimonials": z.object({
            "heading": z.string(),
            "subheading": z.string(),
            "items": z.array(z.object({
                "id": z.string(),
                "quote": z.string(),
                "name": z.string(),
                "title": z.string(),
                "company": z.string()
            }))
        }),
        "cta": z.object({
            "heading": z.string(),
            "subheading": z.string(),
            "button": z.string()
        })
    }),
    services: z.object({
        "hero": z.object({
            "eyebrow": z.string(),
            "heading": z.string(),
            "subheading": z.string()
        }),
        "services": z.array(z.object({
            "id": z.string(),
            "title": z.string(),
            "tagline": z.string(),
            "description": z.string(),
            "features": z.array(z.object({
                "id": z.string(),
                "text": z.string()
            })),
            "tag": z.string()
        })),
        "process": z.object({
            "heading": z.string(),
            "subheading": z.string(),
            "steps": z.array(z.object({
                "id": z.string(),
                "number": z.string(),
                "title": z.string(),
                "description": z.string()
            }))
        }),
        "cta": z.object({
            "heading": z.string(),
            "subheading": z.string(),
            "button": z.string()
        })
    }),
    about: z.object({
        "hero": z.object({
            "eyebrow": z.string(),
            "heading": z.string(),
            "subheading": z.string()
        }),
        "story": z.object({
            "heading": z.string(),
            "paragraphs": z.array(z.object({
                "id": z.string(),
                "text": z.string()
            }))
        }),
        "mission": z.object({
            "heading": z.string(),
            "statement": z.string(),
            "values": z.array(z.object({
                "id": z.string(),
                "title": z.string(),
                "description": z.string()
            }))
        }),
        "team": z.object({
            "heading": z.string(),
            "subheading": z.string(),
            "members": z.array(z.object({
                "id": z.string(),
                "name": z.string(),
                "role": z.string(),
                "bio": z.string()
            }))
        }),
        "cta": z.object({
            "heading": z.string(),
            "subheading": z.string(),
            "button": z.string()
        })
    }),
    work: z.object({
        "hero": z.object({
            "eyebrow": z.string(),
            "heading": z.string(),
            "subheading": z.string()
        }),
        "projects": z.array(z.object({
            "id": z.string(),
            "title": z.string(),
            "category": z.string(),
            "tagline": z.string(),
            "description": z.string(),
            "outcomes": z.array(z.object({
                "id": z.string(),
                "metric": z.string(),
                "label": z.string()
            })),
            "tags": z.array(z.string())
        })),
        "cta": z.object({
            "heading": z.string(),
            "subheading": z.string(),
            "button": z.string()
        })
    }),
    contact: z.object({
        "hero": z.object({
            "eyebrow": z.string(),
            "heading": z.string(),
            "subheading": z.string()
        }),
        "info": z.object({
            "email": z.string(),
            "location": z.string(),
            "response": z.string()
        }),
        "services_options": z.array(z.object({
            "id": z.string(),
            "label": z.string()
        }))
    }),
    endpoint_management: z.object({
        "hero": z.object({
            "eyebrow": z.string(),
            "heading": z.string(),
            "subheading": z.string(),
            "cta_primary": z.string(),
            "cta_secondary": z.string()
        }),
        "features": z.array(z.object({
            "id": z.string(),
            "title": z.string(),
            "description": z.string()
        })),
        "pricing": z.object({
            "heading": z.string(),
            "subheading": z.string(),
            "price": z.string(),
            "period": z.string(),
            "note": z.string(),
            "includes_heading": z.string(),
            "includes": z.array(z.object({
                "id": z.string(),
                "text": z.string()
            })),
            "cta": z.string(),
            "cta_sub": z.string()
        }),
        "cta": z.object({
            "heading": z.string(),
            "subheading": z.string(),
            "button": z.string()
        })
    }),
    ems_pricing: z.object({
        "hero": z.object({
            "eyebrow": z.string(),
            "heading": z.string(),
            "subheading": z.string()
        }),
        "plans": z.object({
            "monthly_label": z.string(),
            "yearly_label": z.string(),
            "yearly_badge": z.string(),
            "price_monthly": z.number(),
            "price_yearly": z.number(),
            "price_volume_yearly": z.number(),
            "price_volume_monthly": z.number(),
            "volume_threshold": z.number(),
            "volume_note": z.string(),
            "currency": z.string(),
            "period_monthly": z.string(),
            "period_yearly": z.string(),
            "cta": z.string(),
            "cta_sub": z.string()
        }),
        "includes_heading": z.string(),
        "includes": z.array(z.object({
            "id": z.string(),
            "text": z.string()
        })),
        "faq": z.array(z.object({
            "id": z.string(),
            "question": z.string(),
            "answer": z.string()
        })),
        "cta": z.object({
            "heading": z.string(),
            "subheading": z.string(),
            "button": z.string(),
            "button_secondary": z.string()
        })
    })
};
export type Schemas = typeof schemas;