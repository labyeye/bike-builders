import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const CardContainer = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
  },
}));

const IconWrapper = styled(Box)(({ theme, color }) => ({
  display: 'inline-flex',
  padding: theme.spacing(1.5),
  borderRadius: '50%',
  backgroundColor: theme.palette[color].light,
  color: theme.palette[color].main,
  marginBottom: theme.spacing(2),
}));

const StatsCard = ({ title, value, icon, color = 'primary' }) => {
  return (
    <CardContainer color={color}>
      <IconWrapper color={color}>
        {React.cloneElement(icon, { fontSize: 'small' })}
      </IconWrapper>
      <Typography variant="h4" component="div" fontWeight="bold" gutterBottom>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </CardContainer>
  );
};

export default StatsCard;