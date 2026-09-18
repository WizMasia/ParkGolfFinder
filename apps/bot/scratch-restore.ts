import { runReviewPipeline } from './src/pipeline/review';
import { runPromotePipeline } from './src/pipeline/promote';

async function restore() {
  const runId = 'cmplicon70000uccknds2wg65';
  console.log(`Restoring DB from run: ${runId}`);
  
  // Rerun review (deduplication) using the bot's proper logic
  await runReviewPipeline(runId);
  
  // Promote the correctly deduped records to Facility
  await runPromotePipeline(runId);
  
  console.log('Restore complete!');
}

restore().catch(console.error);
