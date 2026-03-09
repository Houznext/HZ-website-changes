import { SentimentDissatisfied } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import React from "react";

const EmptyState = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      textAlign="center"
      p={3}
    >
      <SentimentDissatisfied color="disabled" sx={{ fontSize: 80, mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        <p className="md:text-[16px] font-medium text-[12px]">
          {`No Data Available`}
        </p>
      </Typography>
    </Box>
  );
};

export default EmptyState;
