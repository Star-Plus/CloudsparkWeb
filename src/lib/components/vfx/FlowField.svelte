<script lang="ts">
    import { onMount } from "svelte";

    const colorPallete = ["#5337FF", "#8838FF"];


    class Particle {
    
        effect: Effect;
        maxLength: number;
        timer: number = 0;
        x: number = 0;
        y: number = 0;
        speed: number = Math.random() * 1 + 0.5;
        speedModifier: number = Math.random() * 0.009 - 0.0045;
        angle: number = 0;
        speedX: number = 0.05;
        speedY: number = 0.05;
        color: string = '#FFFFFF';
        history: { x: number; y: number }[] = [];

        constructor(effect: Effect) {
            this.effect = effect;
            this.maxLength = Math.floor(Math.random()*1000+100);
            this.reset();
        }

        draw(context: CanvasRenderingContext2D) {
            context.beginPath();
            context.moveTo(this.history[0].x, this.history[0].y);

            context.lineTo(this.x, this.y);            
            context.strokeStyle = this.color;
            context.stroke();

            this.history = [{ x: this.x, y: this.y }];

        }

        update() {
            this.timer--;
            if (this.timer > 0) {
                let x = Math.floor(this.x / this.effect.cellSize);
                let y = Math.floor(this.y / this.effect.cellSize);

                x = Math.max(0, Math.min(x, this.effect.cols - 1));
                y = Math.max(0, Math.min(y, this.effect.rows - 1));

                let index = y * this.effect.cols + x;
                this.angle = this.effect.flowField[index];

                this.speedX = Math.cos(this.angle) * this.speed;
                this.speedY = Math.sin(this.angle) * this.speed;

                this.speed += this.speedModifier;
                
                this.x += this.speedX;
                this.y += this.speedY;

            } else {
                this.reset();
            }
        }

        reset() {
            this.x = Math.random() * this.effect.width;
            this.y = Math.random() * this.effect.height;
            this.speed = Math.random() * 1 + 0.5;
            this.maxLength = Math.floor(Math.random() * 1000 + 100);
            this.timer = this.maxLength;
            this.color = colorPallete[Math.floor(Math.random() * colorPallete.length)];
            this.history = [{ x: this.x, y: this.y }];
        }
    }

    class Effect {
        width: number;
        height: number;
        particles: Particle[];
        numberOfParticles: number;
        cellSize: number;
        cols: number;
        rows: number;
        flowField: Float32Array | number[];
        curve: number;
        zoom: number;

        constructor(width: number, height: number) {
            this.width = width;
            this.height = height;
            this.particles = [];
            this.numberOfParticles = Math.floor(Math.random() * 2000 + 200);
            this.cellSize = Math.floor(Math.random() * 5 + 1);
            this.cols = 0;
            this.rows = 0;
            this.flowField = [];
            this.curve = Math.random() * 12 + 0.5;
            this.zoom = Math.random() * 0.02 + 0.009;
            this.init(width, height);
        }

        init(width: number, height: number) {
            this.width = width;
            this.height = height;
            this.particles = [];
            this.cols = Math.floor(this.width / this.cellSize);
            this.rows = Math.floor(this.height / this.cellSize);
            this.flowField = new Float32Array(this.cols * this.rows);

            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    let angle = (
                        Math.cos(x * this.zoom) + Math.sin(y * this.zoom)
                    ) * 
                    this.curve;
                    this.flowField[y * this.cols + x] = angle;
                }
            }

            for (let i = 0; i < this.numberOfParticles; i++) {
                this.particles.push(new Particle(this));
            }
        }

        render(context: CanvasRenderingContext2D) {
            this.particles.forEach(p => {
                p.draw(context);
                p.update();
            });
        }
    }

    onMount(() => {
        
        const canvas = document.querySelector('canvas') as HTMLCanvasElement;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = Math.random() * 5 + 0.1;
        
        addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            effect.init(canvas.width, canvas.height);
        });
    
        const effect = new Effect(canvas.width, canvas.height);
        effect.init(canvas.width, canvas.height);

        const clearRatio = Math.random() * 0.8 + 0.005;
    
        function animate() {
    
            ctx.fillStyle = `rgba(12,12,12, ${clearRatio})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    
            effect.render(ctx);
            requestAnimationFrame(animate);
        }
    
        animate();
    })


</script>

<canvas></canvas>

<style>
    canvas {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
    }
</style>
