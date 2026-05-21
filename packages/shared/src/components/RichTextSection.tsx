import { Box, Button, Stack, Typography } from '@mui/material';
import * as React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextSectionProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextSection({
  label,
  value,
  onChange,
  placeholder,
  minHeight = 120,
}: RichTextSectionProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempValue, setTempValue] = React.useState(value);
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    setTempValue(value);
  }, [value, isEditing]);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const hasContent = value && value !== '<p><br></p>' && value !== '';

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#475569' }}>{label}</Typography>
        {!isEditing && (
          <Button
            size="small"
            onClick={() => setIsEditing(true)}
            sx={{
              minWidth: 0,
              p: '2px 8px',
              fontSize: 12,
              fontWeight: 600,
              bgcolor: '#F1F5F9',
              color: '#475569',
              '&:hover': { bgcolor: '#E2E8F0' },
            }}
          >
            {hasContent ? 'Edit' : 'Add'}
          </Button>
        )}
      </Stack>

      {isEditing ? (
        <Box
          sx={{
            '& .quill': {
              bgcolor: '#FFFFFF',
              borderRadius: 1,
              '& .ql-toolbar': {
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                borderColor: '#E2E8F0',
                bgcolor: '#F8FAFC',
              },
              '& .ql-container': {
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 4,
                borderColor: '#E2E8F0',
                minHeight: minHeight,
                fontSize: 14,
                fontFamily: 'inherit',
                '& .ql-editor': {
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                },
              },
            },
          }}
        >
          <ReactQuill
            theme="snow"
            value={tempValue}
            onChange={setTempValue}
            placeholder={placeholder}
            modules={{
              toolbar: [
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['clean'],
              ],
            }}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleSave}
              sx={{
                bgcolor: '#0F172A',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: '#1E293B' },
              }}
            >
              Save
            </Button>
            <Button
              size="small"
              onClick={handleCancel}
              sx={{ fontWeight: 600, textTransform: 'none', color: '#64748B' }}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      ) : (
        <Box
          onClick={() => !hasContent && setIsEditing(true)}
          sx={{
            p: hasContent ? 0 : 2,
            bgcolor: hasContent ? 'transparent' : '#F8FAFC',
            borderRadius: 1,
            cursor: hasContent ? 'default' : 'pointer',
            '&:hover': {
              bgcolor: hasContent ? 'transparent' : '#F1F5F9',
            },
          }}
        >
          {hasContent ? (
            <Box className="ql-snow">
              <Box
                className="ql-editor"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: '#1E293B',
                  maxHeight: isExpanded ? 'none' : 200,
                  overflow: 'hidden',
                  position: 'relative',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  p: '0 !important',
                  '& p': { mb: 1.5 },
                  '& ul': {
                    pl: 2.5,
                    mb: 1.5,
                    listStyle: 'disc outside !important',
                  },
                  '& ol': {
                    pl: 2.5,
                    mb: 1.5,
                    listStyle: 'decimal outside !important',
                  },
                  '& li': {
                    display: 'list-item !important',
                    mb: 0.5,
                    '& p': { display: 'inline', mb: 0 },
                  },
                }}
                dangerouslySetInnerHTML={{ __html: value }}
              />
              {value.length > 500 && (
                <Button
                  size="small"
                  onClick={() => setIsExpanded(!isExpanded)}
                  sx={{
                    mt: 0.5,
                    p: 0,
                    minWidth: 0,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#64748B',
                    '&:hover': { bgcolor: 'transparent', color: '#0F172A' },
                  }}
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </Button>
              )}
            </Box>
          ) : (
            <Typography sx={{ fontSize: 14, color: '#94A3B8' }}>{placeholder}</Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
