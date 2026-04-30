from flask import Blueprint, request, jsonify
from app import db
from app.models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Vérifier si l'email existe déjà
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email déjà utilisé'}), 400
    
    # Créer le nouvel utilisateur
    nouvel_user = User(
        nom=data['nom'],
        email=data['email'],
        mot_de_passe=generate_password_hash(data['mot_de_passe'])
    )
    
    db.session.add(nouvel_user)
    db.session.commit()
    
    return jsonify({'message': 'Compte créé avec succès !'}), 201
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Chercher l'utilisateur par email
    user = User.query.filter_by(email=data['email']).first()
    
    # Vérifier si l'utilisateur existe et le mot de passe est correct
    if not user or not check_password_hash(user.mot_de_passe, data['mot_de_passe']):
        return jsonify({'message': 'Email ou mot de passe incorrect'}), 401
    
    # Créer le token JWT
    token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'nom': user.nom,
            'email': user.email
        }
    }), 200
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Transaction

trans_bp = Blueprint('transactions', __name__)

@trans_bp.route('/', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    transactions = Transaction.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        'id': t.id,
        'type': t.type,
        'montant': t.montant,
        'categorie': t.categorie,
        'description': t.description,
        'date': t.date.strftime('%Y-%m-%d')
    } for t in transactions]), 200

@trans_bp.route('/', methods=['POST'])
@jwt_required()
def add_transaction():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    nouvelle_transaction = Transaction(
        user_id=user_id,
        type=data['type'],
        montant=data['montant'],
        categorie=data['categorie'],
        description=data.get('description', '')
    )
    
    db.session.add(nouvelle_transaction)
    db.session.commit()
    
    return jsonify({'message': 'Transaction ajoutée !'}), 201