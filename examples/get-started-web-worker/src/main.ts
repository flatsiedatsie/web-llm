import * as webllm from "@mlc-ai/web-llm";

function setLabel(id: string, text: string) {
  const label = document.getElementById(id);
  if (label == null) {
    throw Error("Cannot find label " + id);
  }
  label.innerText = text;
}

// There are two demonstrations, pick one to run

/**
 * Chat completion (OpenAI style) without streaming, where we get the entire response at once.
 */
async function mainNonStreaming() {
  const initProgressCallback = (report: webllm.InitProgressReport) => {
    setLabel("init-label", report.text);
  };
  const selectedModel = "Llama-3-8B-Instruct-q4f32_1";

  const engine: webllm.EngineInterface = await webllm.CreateWebWorkerEngine(
    new Worker(
      new URL('./worker.ts', import.meta.url),
      { type: 'module' }
    ),
    selectedModel,
    { initProgressCallback: initProgressCallback }
  );

  const request: webllm.ChatCompletionRequest = {
    messages: [
      {
        "role": "system",
        "content": "You are a helpful, respectful and honest assistant. " +
          "Be as happy as you can when speaking please. "
      },
      { "role": "user", "content": "Provide me three US states." },
      { "role": "assistant", "content": "California, New York, Pennsylvania." },
      { "role": "user", "content": "Two more please!" },
    ],
    n: 3,
    temperature: 1.5,
    max_gen_len: 256,
  };

  const reply0 = await engine.chat.completions.create(request);
  console.log(reply0);

  console.log(await engine.runtimeStatsText());
}

/**
 * Chat completion (OpenAI style) with streaming, where delta is sent while generating response.
 */
async function mainStreaming() {
  const initProgressCallback = (report: webllm.InitProgressReport) => {
    setLabel("init-label", report.text);
  };
  const selectedModel = "Llama-3-8B-Instruct-q4f32_1";

  const engine: webllm.EngineInterface = await webllm.CreateWebWorkerEngine(
    new Worker(
      new URL('./worker.ts', import.meta.url),
      { type: 'module' }
    ),
    selectedModel,
    { initProgressCallback: initProgressCallback }
  );

  const request: webllm.ChatCompletionRequest = {
    stream: true,
    messages: [
      {
        "role": "system",
        "content": "You are a helpful, respectful and honest assistant. " +
          "Be as happy as you can when speaking please. "
      },
      { "role": "user", "content": "Provide me three US states." },
      { "role": "assistant", "content": "California, New York, Pennsylvania." },
      { "role": "user", "content": "Two more please!" },
    ],
    temperature: 1.5,
    max_gen_len: 256,
  };

  const asyncChunkGenerator = await engine.chat.completions.create(request);
  let message = "";
  for await (const chunk of asyncChunkGenerator) {
    console.log(chunk);
    if (chunk.choices[0].delta.content) {
      // Last chunk has undefined content
      message += chunk.choices[0].delta.content;
    }
    setLabel("generate-label", message);
    // engine.interruptGenerate();  // works with interrupt as well
  }
  console.log("Final message:\n", await engine.getMessage());  // the concatenated message
  console.log(await engine.runtimeStatsText());
}

let my_webllm = {};
	my_webllm['engine'] = null;
	my_webllm['model'] = null;
	
	my_webllm['initProgressCallback'] = (report) => {
       	console.log("WebLLM: init report: ", report);
   	};
	my_webllm['initCompleteCallback'] = () => {
       	console.log("WebLLM: init complete");
   	};
	my_webllm['chunkCallback'] = (chunk, message_so_far, addition) => {
		console.log("WebLLM: chunk callback: chunk,message_so_far,addition: ", chunk, message_so_far, addition);
	}
	my_webllm['completeCallback'] = (message) => {
		console.log("WebLLM: complete callback: message: ", message);
	}
	my_webllm['statsCallback'] = (stats) => {
		console.log("WebLLM: stats callback: stats: ", stats);
	}
	
	
	my_webllm['loadModel'] = async function(selectedModel) {
		if(typeof selectedModel != 'string'){
			if(typeof my_webllm.model == 'string'){
				selectedModel = my_webllm.model;
				console.log("WebLLM: loadModel: using cached model id: ", selectedModel);
			}
			else{
				console.error("WebLLM: no valid model string provided");
			}
			
		}
		if(typeof selectedModel == 'string'){
			my_webllm['engine'] = await _webLlm.CreateWebWorkerEngine(new Worker(require("b16cbe164a5b9742")), selectedModel, {
		       initProgressCallback: my_webllm.initProgressCallback
			});
			my_webllm.initCompleteCallback();
		}
		else{
			console.error("WebLLM: failed to start engine, no valid model provided?: ", selectedModel);
		}
	}
	
	my_webllm['reloadModel'] = async function(selectedModel) {
		if(typeof selectedModel != 'string'){
			if(typeof my_webllm.model == 'string'){
				selectedModel = my_webllm.model;
				console.log("WebLLM: reloadModel: using cached model id: ", selectedModel);
			}
			else{
				console.error("WebLLM: reloadModel: no valid model string provided");
			}
			
		}
		if(typeof selectedModel == 'string' && my_webllm.engine != null){
			await my_webllm.engine.reload(selectedModel);
		}
	}

		
	my_webllm['setInitProgressCallback'] = async function(initProgressCallback) {
		if(typeof initProgressCallback === 'function'){
			my_webllm['initProgressCallback'] = initProgressCallback;
		}
		else{
			console.error("WebLLM: no valid initProgressCallback provided");
		}
	}
	my_webllm['setInitCompleteCallback'] = async function(initCompleteCallback) {
		if(typeof initCompleteCallback === 'function'){
			my_webllm['initCompleteCallback'] = initCompleteCallback;
		}
		else{
			console.error("WebLLM: no valid initCompleteCallback provided");
		}
	}
	my_webllm['setChunkCallback'] = async function(chunkCallback) {
		if(typeof chunkCallback === 'function'){
			my_webllm['chunkCallback'] = chunkCallback;
		}
		else{
			console.error("WebLLM: no valid chunkCallback provided");
		}
	}
	my_webllm['setCompleteCallback'] = async function(completeCallback) {
		if(typeof completeCallback === 'function'){
			my_webllm['completeCallback'] = completeCallback;
		}
		else{
			console.error("WebLLM: no valid completeCallback provided");
		}
	}
	my_webllm['setStatsCallback'] = async function(statsCallback) {
		if(typeof statsCallback === 'function'){
			my_webllm['statsCallback'] = statsCallback;
		}
		else{
			console.error("WebLLM: no valid statsCallback provided");
		}
	}
	
	
	my_webllm['doChat'] = async function(request) {
		if(my_webllm.engine == null){
			console.error("WebLLM: aborting, engine has not been started yet");
			return false
		}
		if(typeof request != 'undefined' && request != null && typeof request.messages != 'undefined'){
		    const asyncChunkGenerator = await my_webllm.engine.chat.completions.create(request);
		    let message = "";
		    for await (const chunk of asyncChunkGenerator){
		        //console.log("WebLLM: doChat: chunk: ", chunk);
		        if (chunk.choices[0].delta.content) // Last chunk has undefined content
		        message += chunk.choices[0].delta.content;
				    my_webllm['chunkCallback'](chunk, message, chunk.choices[0].delta.content);
		        setLabel("generate-label", message);
		    // engine.interruptGenerate();  // works with interrupt as well
		    }
			
			const final_message = await my_webllm.engine.getMessage();
			my_webllm.completeCallback(final_message);
		    console.log("WebLLM: Final message:\n", final_message); // the concatenated message]
			
			let stats = await my_webllm.engine.runtimeStatsText();
			my_webllm['statsCallback'](stats);
		    //console.log("WebLLM: stats: ", stats);
		}
		else{
			console.error("WebLLM: no valid prompt message provided");
		}
	}
	window.my_webllm = my_webllm;
	console.log("You can now use window.my_webllm: ", window.my_webllm);


// Run one of the function below
// mainNonStreaming();
//mainStreaming();
