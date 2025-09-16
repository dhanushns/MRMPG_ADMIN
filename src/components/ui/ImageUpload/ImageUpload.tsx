import React, { useState, useRef, useCallback } from 'react';
import ui from '@/components/ui';
import { ApiClient } from '@/utils';
import './ImageUpload.scss';

export interface UploadedImage {
    id: string;
    fileName: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    url: string;
    uploadedAt: string;
}

export interface ImageUploadProps {
    accept?: string;
    maxSize?: number; // in bytes
    maxFiles?: number;
    multiple?: boolean;
    onUploadSuccess?: (images: UploadedImage[]) => void;
    onUploadError?: (error: string) => void;
    onRemove?: (imageId: string) => void;
    initialImages?: UploadedImage[];
    uploadEndpoint?: string;
    deleteEndpoint?: string;
    disabled?: boolean;
    className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    accept = 'image/*',
    maxSize = 5 * 1024 * 1024, // 5MB default
    maxFiles = 10,
    multiple = true,
    onUploadSuccess,
    onUploadError,
    onRemove,
    initialImages = [],
    uploadEndpoint = '/api/upload/images',
    deleteEndpoint = '/api/upload/images',
    disabled = false,
    className = ''
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<UploadedImage[]>(initialImages);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    // File validation
    const validateFile = (file: File): string | null => {
        const isImage = file.type.startsWith('image/');
        const isPDF = file.type === 'application/pdf';
        
        if (!isImage && !isPDF) {
            return 'Please select only image files or PDF documents';
        }
        
        if (file.size > maxSize) {
            const sizeMB = (maxSize / (1024 * 1024)).toFixed(1);
            return `File size must be less than ${sizeMB}MB`;
        }

        if (!multiple && images.length >= 1) {
            return 'Only one file is allowed';
        }

        if (images.length >= maxFiles) {
            return `Maximum ${maxFiles} files allowed`;
        }

        return null;
    };

    // Upload files to server
    const uploadFiles = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        
        // Validate all files first
        for (const file of files) {
            const error = validateFile(file);
            if (error) {
                onUploadError?.(error);
                setUploading(false);
                return;
            }
            formData.append('images', file);
        }

        try {
            const response = await ApiClient.post(uploadEndpoint, formData) as any;

            if (response.success && response.data) {
                const newImages: UploadedImage[] = Array.isArray(response.data) 
                    ? response.data 
                    : [response.data];
                
                setImages(prev => multiple ? [...prev, ...newImages] : newImages);
                onUploadSuccess?.(newImages);
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            onUploadError?.(errorMessage);
        } finally {
            setUploading(false);
        }
    }, [uploadEndpoint, onUploadSuccess, onUploadError, validateFile, multiple]);

    // Handle file selection
    const handleFileSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        
        const fileArray = Array.from(files);
        uploadFiles(fileArray);
    };

    // Handle button click
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Handle drag and drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setDragOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        
        if (disabled) return;
        
        const files = e.dataTransfer.files;
        handleFileSelect(files);
    };

    // Remove image
    const handleRemove = async (image: UploadedImage) => {
        try {
            const response = await ApiClient.delete(`${deleteEndpoint}/${image.id}`) as any;
            
            if (response.success) {
                setImages(prev => prev.filter(img => img.id !== image.id));
                onRemove?.(image.id);
            } else {
                throw new Error(response.message || 'Failed to delete image');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete image';
            onUploadError?.(errorMessage);
        }
    };

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const containerClasses = [
        'image-upload',
        className,
        disabled && 'image-upload--disabled',
        dragOver && 'image-upload--drag-over'
    ].filter(Boolean).join(' ');

    return (
        <div className={containerClasses}>
            {/* Upload Area */}
            <div 
                className="image-upload__drop-zone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="image-upload__upload-area">
                    <ui.Icons name="image" className="image-upload__upload-icon" />
                    <h4 className="image-upload__upload-title">
                        {dragOver ? 'Drop files here' : 'Upload Files'}
                    </h4>
                    <p className="image-upload__upload-description">
                        Drag and drop files here, or click to select files
                    </p>
                    <p className="image-upload__upload-info">
                        Supports: Images (JPG, PNG, GIF) & PDF • Max size: {formatFileSize(maxSize)} • {maxFiles} files max
                    </p>
                    
                    <ui.Button
                        variant="primary"
                        onClick={handleUploadClick}
                        disabled={disabled || uploading}
                        loading={uploading}
                        className="image-upload__upload-btn"
                    >
                        <ui.Icons name="file" />
                        {uploading ? 'Uploading...' : 'Choose Files'}
                    </ui.Button>
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="image-upload__file-input"
                    disabled={disabled}
                />
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="image-upload__preview-section">
                    <h5 className="image-upload__preview-title">
                        Uploaded Files ({images.length})
                    </h5>
                    <div className="image-upload__preview-grid">
                        {images.map((image) => (
                            <div key={image.id} className="image-upload__preview-item">
                                <div className="image-upload__preview-container">
                                    {image.mimeType === 'application/pdf' ? (
                                        <div className="image-upload__pdf-preview">
                                            <ui.Icons name="file" className="image-upload__pdf-icon" />
                                            <span className="image-upload__pdf-label">PDF</span>
                                        </div>
                                    ) : (
                                        <img
                                            src={image.url}
                                            alt={image.originalName}
                                            className="image-upload__preview-image"
                                            loading="lazy"
                                        />
                                    )}
                                    <div className="image-upload__preview-overlay">
                                        <button
                                            type="button"
                                            className="image-upload__remove-btn"
                                            onClick={() => handleRemove(image)}
                                            title="Remove file"
                                        >
                                            <ui.Icons name="trash" />
                                        </button>
                                    </div>
                                </div>
                                <div className="image-upload__preview-info">
                                    <p className="image-upload__preview-name" title={image.originalName}>
                                        {image.originalName}
                                    </p>
                                    <p className="image-upload__preview-size">
                                        {formatFileSize(image.fileSize)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;