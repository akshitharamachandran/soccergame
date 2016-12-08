#Kendall Zhu 2016
import pygame, sys, time
from pygame.locals import *
import random
import math

#constants
#player and ball sizes are radius
PLAYER_SIZE=22
BALL_SIZE=10
FIELD_LENGTH=1000
FIELD_WIDTH=600
GOAL_SIZE=280

#attacker brain
attacker=[[-0.38287690328798446, -0.5509920583551584, -0.8379924502108774, 0.39854593590549964, 0.9649603517939754], [0.2745010327322393, 0.12551073339599486, 0.22991993577183145, -1.1360053249472093, -0.4897903949854618], [0.02991425027838681, 0.3305936441519189, 0.3964504961596055, -0.6773295055448594, 0.4101366399591367], [-0.3398316464667283, -0.526899961294847, -0.8599850227374073, 0.4061975569715508], [0.3504178833246672, 0.14301315652258537, 0.20785558572979224, -1.1131359375315248]]
attacker2=[[0.10428620621014323, 0.055225160218398385, 0.08728332742619964, -0.8139016330974757, -0.6709068359321457], [-0.7862909688748633, 0.24633854248232373, 0.7955183979566073, -0.5590025906048488, 0.1612875768157431], [0.49340327233982995, -0.383126636836459, 0.9989966798901303, 0.15931300055821274, -1.0292765967450552], [0.15469541454592411, 0.09882591587653622, 0.2302908529721939, -0.7825465130574951], [-0.8283299370151731, 0.09129456403760444, 0.8977634000761868, -0.5546489721481592]]

#Classes

#ball has velocity and position
class ball():
    def __init__(self, pos=None):
        self.pos=pos
        if self.pos==None:
            self.pos=[random.randint(FIELD_LENGTH/2,FIELD_LENGTH),random.randint(0,FIELD_WIDTH)]
        self.velocity=[0,0]

    def slow(self):
        self.velocity[0]/=1.0015
        self.velocity[1]/=1.0015

    #used for when ball is contacted by something
    def bump(self, direction, length):
        self.velocity[0]-=direction[0]*length*1.2
        self.velocity[1]-=direction[1]*length*1.2

    #stop the ball
    def stop(self):
        self.velocity[0]=0
        self.velocity[1]=0

#houses the decision-making of a player i.e. neural net
class instinct():
    def __init__(self, weights):
        #inputs for each node + bias, currently 3 lists of 5 + 2 lists of 4
        #sort of like this: [[5],[5],[5],[4],[4]]
        self.weights=weights
        #three layers of network
        self.inputs=[]
        self.outputs=[]
        self.hidden_layer=[]

    #takes necessary information and determines wheel speeds via neural net
    def findmove(self, player_pos, player_direction, ball_pos):
        #takes the center of the goal and the ball positions as input
        self.inputs = [FIELD_LENGTH,
                       FIELD_WIDTH/2,
                       ball_pos[0],
                       ball_pos[1]]
        #centers coordinates on the player's position and direction
        self.orient(player_pos, player_direction)
        #map input to hidden, using first 3 sets of weights
        self.hidden_layer = self.map_weights(self.inputs, self.weights[0:3],
                                             self.activation_function)
        #map hidden to output, using last 2 sets of weights
        self.output_layer = self.map_weights(self.hidden_layer, self.weights[3:5],
                                             self.output_function)
        return [self.output_layer[0], self.output_layer[1]]

    def map_weights(self, input_layer, weights, fnc):
        ret=[]
        #iterate over weight sets for each node in layer we map to
        for node in weights:
            total=0
            #for each weight set, iterate over all but the last weight
            #and multiply by the corresponding value from previous layer
            for input_number in range(len(node)-1):
                total+=node[input_number]*input_layer[input_number]
            #use last weight to determine bias
            total+=node[len(node)-1]
            #put through output function to determine final value
            ret.append(fnc(total))
        return ret

    #from -1 to 1
    def activation_function(self, total):
        if total > 50:
            return 1
        if total < -50:
            return -1
        return 2/(1+2.718**(-3*total))-1
    
    def output_function(self, total):
        if total > 50:
            return 1
        if total < -50:
            return -1
        return 2/(1+2.718**(-3*total))-1

    #first center on position of player, then
    #use rotation matrix to rotate so y-axis along player's direction
    def orient(self, p, direction):
        for i in range(0, len(self.inputs), 2):
            x=self.inputs[i]-p[0]
            y=p[1]-self.inputs[i+1]
            d=90-direction
            self.inputs[i]= cos(d)*x-sin(d)*y
            self.inputs[i+1]= sin(d)*x+cos(d)*y
            self.inputs[i]=self.inputs[i]/abs(self.inputs[i]+.0001)
            self.inputs[i+1]=self.inputs[i+1]/abs(self.inputs[i+1]+.0001)

    #change every weight by normal distribution with .02 std deviation
    def mutate(self):
        weights=[]
        for i in range(3):
            node=[]
            for j in range(5):
                node.append(random.normalvariate(0,.04)+self.weights[i][j])
            weights.append(node)
        for i in range(2):
            node=[]
            for j in range(4):
                node.append(random.normalvariate(0,.04)+self.weights[i][j])
            weights.append(node)
        return weights

#for player, has position and instinct and direction  
class player():
    def __init__(self, pos, weights, direction=0):
        self.pos=pos
        self.direction=direction
        #initialize brain
        self.instinct=instinct(weights)

    #use instinct to determine move
    def makemove(self, ball):
        #get wheelspeeds from brain
        wheels=self.instinct.findmove(self.pos, self.direction, ball.pos)
        #approximate the resulting motion in x,y
        forward=(wheels[0]+wheels[1])/2
        turn=(wheels[1]-wheels[0])*5
        self.pos[0]+=cos(self.direction)*forward
        self.pos[1]-=sin(self.direction)*forward
        self.direction+=turn
        if self.direction>360:
            self.direction-=360

    #reset to random position and mutate instinct
    def mutate(self):
        pos = [random.randint(0,FIELD_LENGTH),random.randint(0,FIELD_WIDTH)]
        return player(pos,self.instinct.mutate())
    
    def distance(self,other):
        return ((self.pos[0]-other.pos[0])**2+(self.pos[1]-other.pos[1])**2)**(.5)

    #reset to random position
    def random_pos(self):
            self.pos = [random.randint(0,FIELD_LENGTH),random.randint(0,FIELD_WIDTH)]

    def stop(self):
        pass
    
#Initialization and Helper Functions
#scale vector
def scale(x, y, length):
    a=(length**2/(x**2+y**2+.001))**(.5)
    return (a*x,a*y)

def sin(x):
    return math.sin(math.radians(x))

def cos(x):
    return math.cos(math.radians(x))

def random_game():
    players=[]
    for i in range(1):
        player_pos = [random.randint(0,FIELD_LENGTH),random.randint(0,FIELD_WIDTH)]
        players.append(player(player_pos, attacker))
        player_pos = [random.randint(0,FIELD_LENGTH),random.randint(0,FIELD_WIDTH)]
        players.append(player(player_pos, random_instinct(), random.randint(0,360)))
    play(players, ball())

def random_instinct():
    weights=[]
    for i in range(3):
        node=[]
        for j in range(5):
            node.append(random.uniform(-1,1))
        weights.append(node)
    for i in range(2):
        node=[]
        for j in range(4):
            node.append(random.uniform(-1,1))
        weights.append(node)
    return weights

#Game Functions
def update(players, ball):
    #move ball
    ball.pos[0]+=ball.velocity[0]
    ball.pos[1]+=ball.velocity[1]
    ball.slow()
    #check for goal
    bottom=(FIELD_WIDTH+GOAL_SIZE)/2
    top=(FIELD_WIDTH-GOAL_SIZE)/2
    if ball.pos[0]>=FIELD_LENGTH and ball.pos[1]<bottom and ball.pos[1]>top:
        return "goal"
    isout=0
    for p in players:
        #players move
        p.makemove(ball)
        #collisions with other players
        for p2 in players:
            if(p!=p2 and p.distance(p2)<PLAYER_SIZE):
                direction=(p.pos[0]-p2.pos[0],p.pos[1]-p2.pos[1])
                length=(PLAYER_SIZE-((direction[0]**2)+(direction[1]**2))**(.5))/2
                direction=scale(direction[0], direction[1], length)
                p.pos=[p.pos[0]+direction[0],p.pos[1]+direction[1]]
                p2.pos=[p2.pos[0]-direction[0],p2.pos[1]-direction[1]]
        #collision with ball
        if(p.distance(ball)<PLAYER_SIZE+BALL_SIZE):
            direction=(p.pos[0]-ball.pos[0],p.pos[1]-ball.pos[1])
            length=((PLAYER_SIZE+BALL_SIZE)-((direction[0]**2)+(direction[1]**2))**(.5))
            direction=scale(direction[0], direction[1], length)
            ball.pos=[ball.pos[0]-direction[0]*2,ball.pos[1]-direction[1]*2]
            ball.bump(direction, length)
        #isout+=boundary(p)
    isout+=boundary(ball)
    #determine if ball or player is out
    if(isout>0):
        return "out"
    return ""

#keep things in field, return 1 if anything was out.            
def boundary(agent):
    if agent.pos[0]>FIELD_LENGTH:
        agent.pos=[FIELD_LENGTH,agent.pos[1]]
        agent.stop()
        return(1)
    if agent.pos[1]>FIELD_WIDTH:
        agent.pos=[agent.pos[0],FIELD_WIDTH]
        agent.stop()
        return(1)
    if agent.pos[0]<0:
        agent.pos=[0,agent.pos[1]]
        agent.stop()
        return(1)
    if agent.pos[1]<0:
        agent.pos=[agent.pos[0],0]
        agent.stop()
        return(1)
    return 0
    
def draw(players, ball, screen):
    #add reference bar for color to stat comparison at the bottom
    screen.fill((255,255,255))
    #draw players
    for p in players:
        head_x=p.pos[0]+cos(p.direction)*PLAYER_SIZE
        head_y=p.pos[1]-sin(p.direction)*PLAYER_SIZE
        pygame.draw.circle(screen,(0,0,0),(int(p.pos[0]),int(p.pos[1])),PLAYER_SIZE)
        pygame.draw.circle(screen,(255,0,0),(int(head_x),int(head_y)),5)
    #ball
    pygame.draw.circle(screen,(100,0,100),(int(ball.pos[0]),int(ball.pos[1])),BALL_SIZE)
    #goals
    top=(FIELD_WIDTH-GOAL_SIZE)/2
    pygame.draw.rect(screen, (0,0,255), Rect(995,top,5,GOAL_SIZE),3)
    pygame.display.update()

#Simulation functions
#take generation and fill up to 100 with randos
def init_generation(old=[]):
    generation=old
    for i in range(1000-len(generation)):
        player_pos = [random.randint(0,FIELD_LENGTH),random.randint(0,FIELD_WIDTH)]
        generation.append(player(player_pos, random_instinct(), random.randint(0,360)))
    return generation

#run simulation on a generation to create a new set
def select(generation):
    #put ones who didn't allow score
    candidates=[]
    new=[]
    bot = player([0,0], attacker)
    bot2 = player([0,0], attacker)
    for defender in generation:
        defender.pos=[800,300]
        bot.pos=[300,300]
        bot2.pos=[400,300]
        frames=0
        b = ball([600,300])
        status=""
        while(frames < 5000):
            status=update([defender, bot, bot2], b)
            if status=="goal":
                break
            frames+=1
        if status!="goal":
            new.append(defender)
            candidates.append(defender)
    print(len(candidates))
    #test candidates for performance and put in babies accordingly
    for candidate in candidates:
        fitness=10
        for i in range(10):
            candidate.pos=[800,300]
            bot.pos=[300,300]
            bot2.pos=[300,300]
            b = ball()
            frames=0
            status=""
            n=5000
            while(frames < n):
                status=update([candidate, bot, bot2], b)
                if status=="goal":
                    fitness-=1
                    break
                frames+=1
            if status!="goal":
                n+=1000
        for i in range(int(10/(len(candidates)**1.5)*fitness**2)):
            new.append(candidate.mutate())
    print(len(new))
    return new

#run a simulation for g generations
def evolve(g):
    old = []
    #old.append(player([0,0],BRAIN))
    for i in range(g):
        print("generation: " + str(i))
        generation=init_generation(old)
        old=select(generation)
    return old

#takes a presumable final evolved generation and grades the performance of the members
#into tiers, displaying these tiers and letting us watch them run from best to worst.
#also prints the brains as it goes so we know what they are.
def display(generation):
    best=[]
    generation_fitness={0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[],10:[]}
    #test candidates for performance and put in babies accordingly
    bot = player([0,0], attacker)
    bot2 = player([0,0], attacker)
    for defender in generation:
        fitness=10
        for i in range(10):
            defender.pos=[800,300]
            bot.pos=[300,300]
            bot2.pos=[400,300]
            b = ball()
            frames=0
            status=""
            n=5000
            while(frames < n):
                status=update([defender, bot, bot], b)
                if status=="goal":
                    fitness-=1
                    break
                frames+=1
            if status!="goal":
                n+=1000
        generation_fitness[fitness].append(defender)
    
    for i in range(10,0,-1):
        print(str(i)+":"+str(len(generation_fitness[i])))
        for p in generation_fitness[i]:
            print(p.instinct.weights)
            for i in range(10):
                p.pos=[800,300]
                bot.pos=[300,300]
                play([p, bot, bot2],ball())
    
#Play with graphics        
def play(players, ball):
    pygame.init()
    screen=pygame.display.set_mode((FIELD_LENGTH,FIELD_WIDTH))
    pygame.display.set_caption("SoccerLand!")
    screen.fill((0,0,0))
    playing=True
    frames = 0
    time.sleep(3)
    while playing:
        update(players, ball)
        draw(players, ball, screen)
        for event in pygame.event.get():
            if event.type==QUIT or (event.type==KEYUP and event.key== K_ESCAPE):
                playing=False
        time.sleep(0)
        frames+=1
    pygame.quit()

random_game()
#display(evolve(50))

