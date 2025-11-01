import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const CardContainer = styled(Box)(({ theme, color = "primary" }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(2.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  transition: "all 0.3s ease",
  height: "100%",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[3],
  },
  borderLeft: `4px solid ${theme.palette[color].main}`,
}));

const IconWrapper = styled(Box)(({ theme, color = "primary" }) => ({
  display: "inline-flex",
  padding: theme.spacing(1.25),
  borderRadius: "12px",
  backgroundColor: theme.palette[color].light,
  color: theme.palette[color].main,
  marginBottom: theme.spacing(1.5),
  width: "fit-content",
  "& .MuiSvgIcon-root": {
    fontSize: "1.25rem",
  },
}));

const ChangeIndicator = styled(Box)(({ theme, ispositive }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  color:
    ispositive === "true"
      ? theme.palette.success.main
      : theme.palette.error.main,
  fontSize: "0.8125rem",
  fontWeight: 500,
  marginTop: theme.spacing(0.5),
}));

const StatsCard = ({
  title,
  value,
  icon,
  color = "primary",
  change,
  isPositive,
}) => {
  return (
    <CardContainer color={color}>
      <Box display="flex" flexDirection="column" flexGrow={1}>
        <IconWrapper color={color}>
          {React.cloneElement(icon, { fontSize: "inherit" })}
        </IconWrapper>

        <Typography
          variant="h3"
          component="div"
          fontWeight={700}
          sx={{
            fontSize: { xs: "1.75rem", sm: "2rem" },
            lineHeight: 1.2,
            mb: 0.5,
          }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </Typography>

        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
      </Box>
    </CardContainer>
  );
};

export default StatsCard;
