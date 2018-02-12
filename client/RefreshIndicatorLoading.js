import React from 'react';
import { CircularProgress } from 'material-ui/Progress';

const style = {
  container: {
    position: 'relative',
  },
  refresh: {
    display: 'inline-block',
    position: 'relative',
  },
};

const RefreshIndicatorLoading = () => (
  <div style={style.container}>
    <CircularProgress
      size={40}
      left={10}
      top={0}
      status="loading"
      style={style.refresh}
    />
  </div>
);

export default RefreshIndicatorLoading;
