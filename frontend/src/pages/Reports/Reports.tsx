import { useState } from 'react'
import { TrendingUp, TrendingDown, Coins, FileText, FileSpreadsheet } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { useReportsData, type ReportTimeFilter } from '@/features/reports/useReportsData'
import { useBusiness } from '@/context/BusinessContext'
import Card from '@/components/Card/Card'
import PageTopBar from '@/components/PageTopBar/PageTopBar'
import Loading from '@/components/Loading/Loading'
import TimeFilterTabs from '@/components/TimeFilterTabs/TimeFilterTabs'
import { useChartColors } from '@/lib/chartColors'
import { useIsMobile } from '@/hooks/useIsMobile'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

function IconBadge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: bg,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  )
}

export default function Reports() {
  const [timeFilter, setTimeFilter] = useState<ReportTimeFilter>('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [appliedFrom, setAppliedFrom] = useState('')
  const [appliedTo, setAppliedTo] = useState('')

  const { data, loading } = useReportsData(timeFilter, appliedFrom, appliedTo)
  const { business } = useBusiness()
  const chart = useChartColors()
  const isMobile = useIsMobile()

  if (loading || !data) return <Loading />

  function handleApplyCustom() {
    setAppliedFrom(customFrom)
    setAppliedTo(customTo)
  }

  function handleExportPDF() {
    if (!data) return
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const centerX = pageWidth / 2

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(0)
    doc.text(business?.name ?? 'Sukses', centerX, 18, { align: 'center' })

    let y = 25
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    if (business?.address) {
      doc.text(business.address, centerX, y, { align: 'center' })
      y += 5
    }
    if (business?.phone) {
      doc.text(business.phone, centerX, y, { align: 'center' })
      y += 5
    }

    y += 3
    doc.setDrawColor(0)
    doc.setLineWidth(0.4)
    doc.line(14, y, pageWidth - 14, y)
    y += 8

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Laporan Bisnis', centerX, y, { align: 'center' })
    y += 5
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(90)
    doc.text(`Periode: ${data.periodLabel}`, centerX, y, { align: 'center' })
    doc.setTextColor(0)
    y += 8

    const grayHead = { fillColor: [230, 230, 230] as [number, number, number], textColor: 0 as any, fontStyle: 'bold' as const }
    const grayAlt = { fillColor: [245, 245, 245] as [number, number, number] }

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Tabel Transaksi', 14, y)
    autoTable(doc, {
      startY: y + 4,
      head: [['Tanggal', 'No. Struk', 'Produk', 'Kategori', 'Qty', 'Harga', 'Subtotal']],
      body: data.transactionItemRows.map((r) => [
        r.date,
        r.trx_number,
        r.product,
        r.category,
        String(r.qty),
        formatRupiah(r.price),
        formatRupiah(r.subtotal),
      ]),
      headStyles: grayHead,
      alternateRowStyles: grayAlt,
      styles: { textColor: 20, fontSize: 8 },
      theme: 'grid',
    })

    let nextY = (doc as any).lastAutoTable.finalY + 12
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Tabel Pengeluaran', 14, nextY)
    autoTable(doc, {
      startY: nextY + 4,
      head: [['Tanggal', 'Deskripsi', 'Kategori', 'Jumlah']],
      body: data.expenseRows.map((r) => [r.date, r.description, r.category, formatRupiah(r.amount)]),
      headStyles: grayHead,
      alternateRowStyles: grayAlt,
      styles: { textColor: 20, fontSize: 8 },
      theme: 'grid',
    })

    nextY = (doc as any).lastAutoTable.finalY + 12
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Ringkasan', 14, nextY)
    autoTable(doc, {
      startY: nextY + 4,
      head: [['Ringkasan', 'Nilai']],
      body: [
        ['Total Penjualan', formatRupiah(data.totalSales)],
        ['Jumlah Transaksi', String(data.transactionCount)],
        ['Item Terjual', String(data.totalItemsSold)],
        ['Rata-rata Transaksi', formatRupiah(data.avgTransaction)],
        ['Modal Barang', formatRupiah(data.costOfGoods)],
        ['Laba Kotor', formatRupiah(data.grossProfit)],
        ['Total Pengeluaran', formatRupiah(data.totalExpenses)],
      ],
      headStyles: grayHead,
      alternateRowStyles: grayAlt,
      styles: { textColor: 20, fontSize: 9 },
      theme: 'grid',
    })

    doc.save(`laporan-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  function handleExportExcel() {
    if (!data) return

    const trxSheet = XLSX.utils.json_to_sheet(
      data.transactionItemRows.map((r) => ({
        Tanggal: r.date,
        'No. Struk': r.trx_number,
        Produk: r.product,
        Kategori: r.category,
        Qty: r.qty,
        Harga: r.price,
        Subtotal: r.subtotal,
      }))
    )
    const expSheet = XLSX.utils.json_to_sheet(
      data.expenseRows.map((r) => ({ Tanggal: r.date, Deskripsi: r.description, Kategori: r.category, Jumlah: r.amount }))
    )
    const summarySheet = XLSX.utils.json_to_sheet([
      { Ringkasan: 'Total Penjualan', Nilai: data.totalSales },
      { Ringkasan: 'Jumlah Transaksi', Nilai: data.transactionCount },
      { Ringkasan: 'Item Terjual', Nilai: data.totalItemsSold },
      { Ringkasan: 'Rata-rata Transaksi', Nilai: data.avgTransaction },
      { Ringkasan: 'Modal Barang', Nilai: data.costOfGoods },
      { Ringkasan: 'Laba Kotor', Nilai: data.grossProfit },
      { Ringkasan: 'Total Pengeluaran', Nilai: data.totalExpenses },
    ])

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, trxSheet, 'Transaksi')
    XLSX.utils.book_append_sheet(wb, expSheet, 'Pengeluaran')
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Ringkasan')
    XLSX.writeFile(wb, `laporan-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (isMobile) {
    return (
      <div>
        <PageTopBar title="Laporan" showFilter={false} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <TimeFilterTabs
            value={timeFilter}
            onChange={setTimeFilter}
            customFrom={customFrom}
            customTo={customTo}
            onCustomFromChange={setCustomFrom}
            onCustomToChange={setCustomTo}
            onApplyCustom={handleApplyCustom}
          />
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleExportPDF}
              aria-label="Unduh PDF"
              style={{
                width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--color-border)',
                background: 'var(--color-card)', color: 'var(--color-text)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <FileText size={16} />
            </button>
            <button
              onClick={handleExportExcel}
              aria-label="Unduh Excel"
              style={{
                width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--color-border)',
                background: 'var(--color-card)', color: 'var(--color-text)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <FileSpreadsheet size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Penjualan</div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{formatRupiah(data.totalSales)}</div>
          </div>
          <div style={{ flex: 1, background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Pengeluaran</div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{formatRupiah(data.totalExpenses)}</div>
          </div>
        </div>

        <div style={{ background: 'var(--color-accent)', border: '1px solid var(--color-accent-border)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--color-on-accent-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Laba Bersih</div>
            <Coins size={18} color="var(--color-on-accent)" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-on-accent)', marginBottom: 14 }}>{formatRupiah(data.grossProfit)}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-on-accent-muted)' }}>
            <span>Item terjual</span>
            <span style={{ fontWeight: 700, color: 'var(--color-on-accent)' }}>{data.totalItemsSold} item</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-on-accent-muted)' }}>
            <span>Rata-rata</span>
            <span style={{ fontWeight: 700, color: 'var(--color-on-accent)' }}>{formatRupiah(data.avgTransaction)}</span>
          </div>
        </div>

        <Card style={{ boxShadow: 'var(--shadow-card)', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Tren Pendapatan</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.chartData}>
              <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={10} />
              <YAxis stroke="var(--color-text-muted)" fontSize={10} width={44} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}rb` : String(v))} />
              <Tooltip
                formatter={(value) => formatRupiah(Number(value))}
                contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text)' }}
              />
              <Bar dataKey="sales" fill={chart.sales} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Produk Terlaris</h3>
          {data.bestSellers.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Belum ada penjualan</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.bestSellers.map((item, i) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--color-primary-tint)', color: 'var(--color-primary-tint-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{item.name}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{item.qty} terjual</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageTopBar
        title="Laporan Bisnis"
        showFilter={false}
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleExportPDF}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20,
                border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-text)', cursor: 'pointer', fontSize: 14,
              }}
            >
              <FileText size={15} /> PDF
            </button>
            <button
              onClick={handleExportExcel}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20,
                border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-text)', cursor: 'pointer', fontSize: 14,
              }}
            >
              <FileSpreadsheet size={15} /> Excel
            </button>
          </div>
        }
      />

      <div style={{ marginBottom: 20 }}>
        <TimeFilterTabs
          value={timeFilter}
          onChange={setTimeFilter}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
          onApplyCustom={handleApplyCustom}
        />
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        <Card style={{ boxShadow: 'var(--shadow-card)', flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <IconBadge bg="var(--color-primary-tint)" color="var(--color-primary-tint-text)">
              <TrendingUp size={18} />
            </IconBadge>
            <h3 style={{ fontSize: 15 }}>Laporan Penjualan</h3>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>{formatRupiah(data.totalSales)}</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Transaksi</div>
              <div style={{ fontWeight: 600 }}>{data.transactionCount}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Item Terjual</div>
              <div style={{ fontWeight: 600 }}>{data.totalItemsSold}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Rata-rata</div>
              <div style={{ fontWeight: 600 }}>{formatRupiah(data.avgTransaction)}</div>
            </div>
          </div>
        </Card>

        <Card style={{ boxShadow: 'var(--shadow-card)', flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <IconBadge bg="var(--color-accent)" color="var(--color-on-accent)">
              <Coins size={18} />
            </IconBadge>
            <h3 style={{ fontSize: 15 }}>Laporan Laba</h3>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-primary-text)', marginBottom: 16 }}>
            {formatRupiah(data.grossProfit)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Total Penjualan</span>
            <span style={{ fontWeight: 600 }}>{formatRupiah(data.totalSales)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Modal Barang</span>
            <span style={{ fontWeight: 600, color: 'var(--color-danger-text)' }}>-{formatRupiah(data.costOfGoods)}</span>
          </div>
        </Card>

        <Card
          style={{
            boxShadow: 'var(--shadow-card)',
            flex: 1,
            minWidth: 260,
            background: 'var(--color-inverse-surface)',
            borderColor: 'transparent',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <IconBadge bg="var(--color-on-inverse-tint)" color="var(--color-on-inverse)">
              <TrendingDown size={18} />
            </IconBadge>
            <h3 style={{ fontSize: 15, color: 'var(--color-on-inverse)' }}>Laporan Pengeluaran</h3>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-on-inverse)', marginBottom: 12 }}>
            {formatRupiah(data.totalExpenses)}
          </div>
          <p style={{ color: 'var(--color-on-inverse-muted)', fontSize: 13 }}>
            Total pengeluaran operasional untuk periode ini.
          </p>
        </Card>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <Card style={{ boxShadow: 'var(--shadow-card)', flex: 2, minWidth: 320 }}>
          <h3 style={{ marginBottom: 16 }}>Tren Pendapatan</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.chartData}>
              <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={11} />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(v: number) => v.toLocaleString('id-ID')} width={70} />
              <Tooltip
                formatter={(value) => formatRupiah(Number(value))}
                contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text)' }}
              />
              <Bar dataKey="sales" fill={chart.sales} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ boxShadow: 'var(--shadow-card)', flex: 1, minWidth: 260 }}>
          <h3 style={{ marginBottom: 16 }}>Produk Terlaris</h3>
          {data.bestSellers.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Belum ada penjualan</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.bestSellers.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-text)', flexShrink: 0 }}>
                  {item.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ flex: 1, fontWeight: 600 }}>{item.name}</span>
                <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'var(--color-primary-tint)', color: 'var(--color-primary-tint-text)' }}>
                  {item.qty} terjual
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}