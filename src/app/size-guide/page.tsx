import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Size Guide',
  description: 'Find your perfect fit with the AYAT sizing guide for men, women, and children.',
}

export default function SizeGuidePage() {
  return (
    <div className="max-w-[900px] mx-auto px-5 py-16 lg:py-24">
      <div className="text-center mb-14">
        <span className="eyebrow text-sage text-[0.6rem] mb-3 block">Fit Guide</span>
        <h1 className="font-serif text-[2rem] lg:text-[2.8rem] text-charcoal mb-3">Size Guide</h1>
        <p className="text-sm text-ink-muted max-w-[400px] mx-auto">
          Use our measurement guide to find your perfect fit. All measurements are in inches.
        </p>
      </div>

      {/* Men's Sizes */}
      <SizeTable
        title="Men's Sizes"
        headers={['Size', 'Chest', 'Shoulder', 'Sleeve', 'Length']}
        rows={[
          ['S', '38', '17', '24', '30'],
          ['M', '40', '18', '25', '31'],
          ['L', '42', '19', '25.5', '32'],
          ['XL', '44', '20', '26', '33'],
          ['XXL', '46', '21', '26.5', '34'],
        ]}
      />

      {/* Women's Sizes */}
      <SizeTable
        title="Women's Sizes"
        headers={['Size', 'Bust', 'Waist', 'Hip', 'Shirt Length']}
        rows={[
          ['XS', '32', '26', '34', '38'],
          ['S', '34', '28', '36', '39'],
          ['M', '36', '30', '38', '40'],
          ['L', '38', '32', '40', '41'],
          ['XL', '40', '34', '42', '42'],
        ]}
      />

      {/* Children's Sizes */}
      <SizeTable
        title="Children's Sizes"
        headers={['Age', 'Chest', 'Length', 'Shoulder']}
        rows={[
          ['2-3 yr', '22', '18', '10'],
          ['4-5 yr', '24', '20', '11'],
          ['6-7 yr', '26', '22', '12'],
          ['8-9 yr', '28', '24', '13'],
          ['10-12 yr', '30', '26', '14'],
        ]}
      />
    </div>
  )
}

function SizeTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="mb-12">
      <h2 className="font-serif text-xl text-charcoal mb-5">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal">
              {headers.map((h) => (
                <th key={h} className="text-left py-3 px-4 font-semibold text-charcoal eyebrow text-[0.6rem]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border hover:bg-parchment transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className={`py-3 px-4 ${j === 0 ? 'font-medium text-charcoal' : 'text-ink-muted'}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
