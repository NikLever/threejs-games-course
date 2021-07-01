class StrengthBar{
	constructor(options){
		this.domElement = document.createElement("div");
		this.domElement.style.position = 'fixed';
		this.domElement.style.bottom = '40px';
		this.domElement.style.width = '50%';
		this.domElement.style.left = '50%';
		this.domElement.style.transform = 'translateX(-50%)';
		this.domElement.style.height = '15px';
		this.domElement.style.display = 'none';
		this.domElement.style.alignItems = 'center';
		this.domElement.style.justifyContent = 'center';
		this.domElement.style.zIndex = '1111';
		const barBase = document.createElement("div");
		barBase.style.background = '#aaa';
		barBase.style.width = '100%';
		barBase.style.minWidth = '100px';
		barBase.style.borderRadius = '10px';
		barBase.style.height = '15px';
		this.domElement.appendChild(barBase);
		const bar = document.createElement("div");
		bar.style.background = '#22a';
		bar.style.width = '0%';
		bar.style.borderRadius = '10px';
		bar.style.height = '100%';
		bar.style.width = '0';
		barBase.appendChild(bar);
		this.strengthBar = bar;

		this._strength = 0;
		
		document.body.appendChild(this.domElement);
	}
	
	update(){
		if (this.visible){
			this._strength += 0.01;
			this.strength = this._strength;
		}
	}

	get strength(){
		return this._strength;
	}

	set strength(strength){
		if (strength<0) strength = 0;
		if (strength>1) strength = 1;
		this._strength = strength;
		const percent = strength*100;
		this.strengthBar.style.width = `${percent}%`;
	}
	
	set visible(value){
		if (value){
			if (!this.visible) this._strength = 0;
			this.domElement.style.display = 'flex';
		}else{
			this.domElement.style.display = 'none';
		}
	}

	get visible(){
		return this.domElement.style.display == 'flex';
	}
}

export { StrengthBar };