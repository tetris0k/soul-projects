class Conversation extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            step: 0,
            running: false,
            time: 0,
            history: [],
            allShows: false,
            countEndShows: 0                            //this is for avoiding ajax requests repeating
        };                                              //while hide/show full conv at the end
        this.nextStep = this.nextStep.bind(this);
        this.toStep = this.toStep.bind(this);
    }

    runStopConv(){
        this.setState({running: !this.state.running});
    }

    nextStep(ans, e){
        e.preventDefault();
        let stt = this.state;
        let st = stt.step;
        let hst =[]; 
        if (st > 0){
            for(let i = 0; i < st-1; i++)
                hst[i] = stt.history[i];
            hst[st-1] = ans;
            this.setState({history: hst, step: st + 1});
        } else {
            if(!this.state.running)
                this.timer = setInterval(() => this.setState({time: this.state.time + 1}), 1000);
            this.runStopConv();
            this.setState({step: st + 1});
        }
        if (hst.length > 0){
            let tmp = this.props.document;
            for(let i in hst){
                tmp = tmp.answers[hst[i]];
            }
            if (this.sizeOfObject(tmp) === 0){
                this.timerPause();
                this.runStopConv();
                this.setState({countEndShows: 0});
            }
        }
    }
    
    toStep(st, history, e){
        e.preventDefault();    
        let nowHistory;
        if(history)
            nowHistory = history;
        else 
            nowHistory = this.state.history;
        let hst = [];
        for (let i = 0; i < Number(st) - 1; i++)
            hst[i] = nowHistory[i];
        if (st==0){
            this.timerPause();
            this.setState({step: Number(st), history: hst, running:false, time:0});
        } else {
            if(!this.state.running)
                this.timer = setInterval(() => this.setState({time: this.state.time + 1}), 1000);
            this.setState({step: Number(st), history: hst, running: true});
        }
    }

    sendResult(){
        let date = new Date();
        let res = {
            "date": date,
            "history": this.state.history,//this.state.history,
            "time": this.state.time
        };
        jQuery.ajax({
            url: '/',
            type: 'POST',
            data: JSON.stringify(res),
            cache: false,
            contentType: "application/json; charset=utf-8",
            success: () => {
                console.log("Your result was successfully sent to the server");
            },
            error: (xhr, status, err) => {
                console.log(xhr.statusText);
                console.log(status);
                console.log(err);
            }
        });
    }

    timerPause(){
        clearInterval(this.timer);
    }

    componentWillUnmount(){
        clearInterval(this.timer);
    }

    showHideFullConv(){
        this.setState({allShows: !this.state.allShows, countEndShows: 1});      //countEndShows == 1 instead of +=1
    }                                                                           //for avoiding memory 

    sizeOfObject(obj){
        let size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    }

    docParser(doc, outArr, index, hist, j){
        self = this;
        outArr[outArr.length] = <div key={outArr.length+" "+"question"} className='question' onClick={self.toStep.bind(self, index + 1, hist[j])}>{"----".repeat(Number(index))}--->{doc.question}</div>;
        let i = 1;
        for (let key in doc.answers){
            if (doc.answers.hasOwnProperty(key)){
                outArr[outArr.length] = <div key={outArr+" "+"answer"+key} className='answer'>{"----".repeat(Number(index) + 1)}{i}){key}</div>;
                let size = self.sizeOfObject(doc.answers[key]);
                if(size > 0){
                    hist[j + size * i] = new Array();
                    for (let k = 0; k < index; k++)
                        hist[j + size * i][k] = hist[j][k];
                    hist[j + size * i][index] = key;
                    self.docParser(doc.answers[key], outArr, index + 1, hist, j + size * i);
                }
            }
            i++;
        }
    }

    render(){
        if (this.state.step === 0){
            return (
                <div class='conversation'>
                    <button className='start' autofocus onClick={this.nextStep.bind(this, null)}> Start the conversation </button>
                    <h4>Time: {this.state.time}</h4>            
                </div>);
        } else {
            let questns = [];
            let tmp = this.props.document;
            if (this.state.history.length > 0){
                for(let i = 0; i < this.state.step-1; i++){
                    questns[i] = tmp.question;
                    if (tmp.answers.hasOwnProperty(this.state.history[i]))
                        tmp = tmp.answers[this.state.history[i]];
                }
            }
            if (this.state.running){              
                let answrs = [];  
                for (let tt in tmp.answers){
                    if (tmp.answers.hasOwnProperty(tt))
                        answrs[answrs.length] = <button className='answer' key={tt} onClick={this.nextStep.bind(this, tt)}>{tt}</button>;
                }
                for (let i in questns){
                    questns[i] = <p key={i} className='question' onClick={this.toStep.bind(this, Number(i)+1, null)}>{Number(i)+1}){questns[i]} : {this.state.history[i]}</p>
                }
                let fullConv = [];
                this.docParser(this.props.document, fullConv, 0, [[]], 0);
                return (
                    <div className='conversation'>
                        <h3 className='big-question'>{tmp.question}</h3>
                        {answrs}
                        <h3>Your progress: </h3>
                        {questns}
                        <h4>Time: {this.state.time}</h4>
                        <button onClick={this.toStep.bind(this, 0, null)}>Reset</button>
                        <button onClick={this.toStep.bind(this, this.state.step - 1, null)}>Step back</button>
                        <button onClick={this.showHideFullConv.bind(this)}>{(this.state.allShows) ? "Hide full conversation" : "Show full conversation"}</button>
                        <div id="fullConversation" style={(this.state.allShows) ? {display: 'block'}: {display: 'none'}}>{fullConv}</div>
                    </div>);
            } else {
                for (let i in questns){
                    questns[i] = <p key={i} className='question' onClick={this.toStep.bind(this, Number(i)+1, null)}>{Number(i)+1}){questns[i]} : {this.state.history[i]}</p>
                }
                let fullConv = [];
                this.docParser(this.props.document, fullConv, 0, [[]], 0);
                if (this.state.countEndShows == 0)
                    this.sendResult();
                return (
                    <div className='conversation'>
                        <h3>Congratulations! You've finished!</h3>
                        <h3>Your progress:</h3>
                        {questns}
                        <h4 className='timer'>Time: {this.state.time}</h4>
                        <button onClick={this.toStep.bind(this, 0, null)}>Reset</button>
                        <button onClick={this.toStep.bind(this, this.state.step - 1, null)}>Step back</button>
                        <button onClick={this.showHideFullConv.bind(this)}>{(this.state.allShows) ? "Hide full conversation" : "Show full conversation"}</button>
                        <div id="fullConversation" style={(this.state.allShows) ? {display: 'block'} : {display: 'none'}}>{fullConv}</div>
                    </div>);
            }
        }
    }
}


let doc = {                                         //random test conversation
    question: "How r u?",
    answers: {
        fine: {
            question: "skjd?",
            answers: {
                first: {
                    question: "lsdfan afdsn?",
                    answers: {
                        resk: {},       //the end
                        kdwoe: {}       //the end
                    }
                },
                second: {
                    question: "hejnxew?",
                    answers: {
                        qwe: {},        //the end
                        asd: {}         //the end
                    }
                },
                third: {}               //the end
            }
        },
        good: {
            question: "woief?",
            answers: {
                first: {},              //the end
                second: {
                    question: "wecne?",
                    answers: {
                        ersdf: {},      //the end
                        sslewe: {}      //the end
                    }
                } 
            }
        },
        bad: {
            question: "erdkfvn?",
            answers: {
                firas: {},              //the end
                kiras: {},              //the end
                linas: {}               //the end
            }
        }                         
    }
};

ReactDOM.render(<Conversation document={doc}/>, document.getElementById('root'));