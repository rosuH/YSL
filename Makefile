.PHONY: install lint test run preview-atlas clean

install:
	pip install -r requirements.txt
	pip install -r requirements-dev.txt

lint:
	flake8 spider.py tests/
	black --check spider.py tests/
	mypy spider.py

format:
	black spider.py tests/

test:
	pytest -v

run:
	python spider.py

preview-atlas:
	python3 scripts/serve_atlas.py 4173

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
