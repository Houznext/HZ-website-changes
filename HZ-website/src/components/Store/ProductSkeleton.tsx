import React from 'react'

export function ProductSkeleton({ height = 190 }: { height?: number }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dde8f5', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ height, background: 'linear-gradient(90deg, #f0f4f8 25%, #e8f1fd 50%, #f0f4f8 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: '12px 13px 14px' }}>
        <div style={{ height: 10, background: '#f0f4f8', borderRadius: 4, marginBottom: 8, width: '40%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: 14, background: '#f0f4f8', borderRadius: 4, marginBottom: 6, width: '90%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: 14, background: '#f0f4f8', borderRadius: 4, marginBottom: 10, width: '70%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: 20, background: '#f0f4f8', borderRadius: 4, marginBottom: 10, width: '50%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: 34, background: '#e8f1fd', borderRadius: 8, animation: 'shimmer 1.5s infinite' }} />
      </div>
      <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
    </div>
  )
}
