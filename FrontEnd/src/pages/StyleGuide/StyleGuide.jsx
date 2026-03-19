import React from 'react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Card from '../../components/UI/Card';
import Table from '../../components/UI/Table';

const styleTableData = [
  { id: '1', name: 'Áo thun', price: 120000, status: 'Còn hàng' },
  { id: '2', name: 'Tai nghe', price: 850000, status: 'Hết hàng' },
  { id: '3', name: 'Laptop', price: 22500000, status: 'Còn hàng' },
];

const styleColumns = [
  { header: 'ID', accessor: 'id' },
  { header: 'Tên Sản Phẩm', accessor: 'name' },
  { header: 'Giá', cell: (row) => row.price.toLocaleString('vi-VN') + ' ₫' },
  { header: 'Tình trạng', accessor: 'status' },
];

const StyleGuide = () => {
  return (
    <main className="min-h-screen bg-bg py-12">
      <div className="container-custom space-y-10">
        <h1 className="text-4xl font-black text-slate-900">Style Guide</h1>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <h2 className="text-lg font-bold mb-2">Typography</h2>
            <p className="text-xs text-neutral-500">body text-sm</p>
            <p className="text-base font-medium">body text-base</p>
            <p className="text-xl font-semibold">heading text-xl</p>
          </Card>

          <Card>
            <h2 className="text-lg font-bold mb-2">Buttons</h2>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold mb-2">Form</h2>
            <div className="space-y-4">
              <Input label="Tên" placeholder="Nhập tên..." />
              <Input label="Email" type="email" placeholder="a@tientech.vn" />
              <Input label="Mật khẩu" type="password" placeholder="********" />
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Table</h2>
          <Table columns={styleColumns} data={styleTableData} />
        </section>
      </div>
    </main>
  );
};

export default StyleGuide;
