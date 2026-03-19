import React from 'react';

const CartSkeleton = () => {
  return (
    <div className="container-custom py-12">
      <div className="w-48 h-10 skeleton mb-8"></div> {/* Title */}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="card-base p-4 flex gap-4">
              <div className="w-24 h-24 skeleton rounded-xl shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="w-1/2 h-5 skeleton"></div>
                <div className="w-1/3 h-4 skeleton"></div>
                <div className="flex justify-between pt-2">
                  <div className="w-24 h-8 skeleton"></div>
                  <div className="w-20 h-8 skeleton"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <div className="card-base p-6 space-y-4">
            <div className="w-1/2 h-6 skeleton mb-4"></div>
            <div className="space-y-3">
              <div className="flex justify-between"><div className="w-20 h-4 skeleton"></div><div className="w-12 h-4 skeleton"></div></div>
              <div className="flex justify-between"><div className="w-24 h-4 skeleton"></div><div className="w-12 h-4 skeleton"></div></div>
              <div className="border-t border-neutral-100 pt-3 flex justify-between">
                <div className="w-16 h-6 skeleton font-bold"></div>
                <div className="w-20 h-6 skeleton font-bold"></div>
              </div>
            </div>
            <div className="w-full h-12 skeleton rounded-xl mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSkeleton;
