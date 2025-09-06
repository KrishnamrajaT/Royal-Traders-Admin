// CustomPagination.js
import React from 'react';
import { Box, Button, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const CustomPagination = ({ count, page, onChange, sx = {} }) => {
  const pagesPerGroup = 5;
  const currentGroup = Math.ceil(page / pagesPerGroup);
  const totalGroups = Math.ceil(count / pagesPerGroup);
  
  const startPage = (currentGroup - 1) * pagesPerGroup + 1;
  const endPage = Math.min(startPage + pagesPerGroup - 1, count);

  const handlePageChange = (newPage) => {
    onChange(null, newPage);
  };

  const goToPrevGroup = () => {
    const newPage = (currentGroup - 2) * pagesPerGroup + 1;
    handlePageChange(newPage);
  };

  const goToNextGroup = () => {
    const newPage = currentGroup * pagesPerGroup + 1;
    handlePageChange(newPage);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}>
      <IconButton
        onClick={goToPrevGroup}
        disabled={currentGroup === 1}
        sx={{
          color: currentGroup === 1 ? 'text.disabled' : 'primary.main',
        }}
      >
        <ChevronLeft />
      </IconButton>

      {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
        const pageNumber = startPage + i;
        return (
          <Button
            key={pageNumber}
            variant={pageNumber === page ? 'contained' : 'outlined'}
            onClick={() => handlePageChange(pageNumber)}
            sx={{
              minWidth: 32,
              height: 32,
              padding: 0,
              borderRadius:3,
              fontWeight: pageNumber === page ? 'bold' : 'normal',
              background: pageNumber === page ? "linear-gradient(45deg, #2563EB 0%, #1E40AF 100%)" : 'transparent',
              color: pageNumber === page ? 'common.white' : 'text.primary',
              '&:hover': {
                background: pageNumber === page ? "linear-gradient(45deg, #2563EB 0%, #1E40AF 100%)" : 'action.hover',
                
              },
            }}
          >
            {pageNumber}
          </Button>
        );
      })}

      <IconButton
        onClick={goToNextGroup}
        disabled={currentGroup >= totalGroups}
        sx={{
          color: currentGroup >= totalGroups ? 'text.disabled' : 'primary.main',
        }}
      >
        <ChevronRight />
      </IconButton>
    </Box>
  );
};

export default CustomPagination;