import React from 'react';
import Dialog, { DialogTitle, DialogContent } from 'material-ui/Dialog';
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
  <Dialog
    fullScreen={false}
    open={true}
    aria-labelledby="responsive-dialog-title"
  >
    <DialogTitle id="responsive-dialog-title">{"Waiting for data........"}</DialogTitle>
    <DialogContent>
      <div style={style.container}>
        <CircularProgress
          size={40}
          left={10}
          top={0}
          status="loading"
          style={style.refresh}
        />
      </div>
    </DialogContent>
  </Dialog>
);

export default RefreshIndicatorLoading;
