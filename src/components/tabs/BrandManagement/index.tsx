import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

interface Brand {
  brandCode: string;
  brandName: string;
  files: Array<{
    filename: string;
    url: string;
    type: string;
    storagePath: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function BrandManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get-brands');
      const data = await response.json();
      
      if (data.success) {
        setBrands(data.brands || []);
      } else {
        setError(data.error || 'Failed to fetch brands');
      }
    } catch (err) {
      setError('Network error while fetching brands');
    } finally {
      setLoading(false);
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'logo':
        return '🖼️';
      case 'locale':
        return '📝';
      case 'config':
        return '⚙️';
      default:
        return '📄';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading brands...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <Button onClick={fetchBrands}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Brand Management</h1>
        <p className="text-gray-600">
          Manage uploaded brands and their associated files
        </p>
      </div>

      {brands.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500 mb-4">No brands uploaded yet</div>
          <p className="text-sm text-gray-400">
            Upload brands through the Brand Setup tab to see them here
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {brands.map((brand) => (
            <Card key={brand.brandCode} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">{brand.brandName}</h2>
                  <p className="text-sm text-gray-500">Code: {brand.brandCode}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>Created: {formatDate(brand.createdAt)}</div>
                  <div>Updated: {formatDate(brand.updatedAt)}</div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium mb-2">Files ({brand.files.length})</h3>
                <div className="grid gap-2">
                  {brand.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span>{getFileTypeIcon(file.type)}</span>
                        <span className="font-mono text-sm">{file.filename}</span>
                        <span className="text-xs text-gray-500">({file.type})</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const brandData = {
                      brandCode: brand.brandCode,
                      brandName: brand.brandName,
                      files: brand.files
                    };
                    const blob = new Blob([JSON.stringify(brandData, null, 2)], {
                      type: 'application/json'
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${brand.brandCode}-config.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export Config
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Button onClick={fetchBrands} variant="outline">
          Refresh Brands
        </Button>
      </div>
    </div>
  );
} 