export default {
  restoreProgress() {
    let out = 0;
    const restoreStatus = this?.status?.restoreStatus || {};

    for (const key in restoreStatus) {
      if (restoreStatus[key]?.progress) {
        out = restoreStatus[key]?.progress;
      }
    }

    return out;
  }
};
