import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['blog'],
      options: [
        { label: 'Blog (Journal)', value: 'blog' },
        { label: 'Portfolio (Work)', value: 'portfolio' },
      ],
      admin: {
        description:
          'Where this category appears as a filter. A category can belong to multiple pages — e.g. select both if "Research" should appear in both Journal and Portfolio filter rows.',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
}
