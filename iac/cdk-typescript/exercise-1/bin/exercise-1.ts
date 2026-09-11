#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { Exercise1Stack } from '../lib/exercise-1-stack';

const app = new cdk.App();
new Exercise1Stack(app, 'Exercise1Stack', {
  // Floci needs an explicit fake account/region — it has no real STS to
  // resolve CDK_DEFAULT_ACCOUNT/REGION from the CLI configuration.
  env: { account: '000000000000', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
